import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

let tokenCache: { accessToken: string; expiresAt: number } | null = null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user) throw new Error("Invalid Token");

    const body = await req.json();
    const txid = crypto.randomUUID().replace(/-/g, "").substring(0, 32);

    const { error: dbErr } = await supabase.from("pix_charges").insert({
      txid,
      user_id: user.id,
      amount: body.valor,
      expires_at: new Date(Date.now() + 600000).toISOString(),
    });
    if (dbErr) throw new Error(`DB Intent Error: ${JSON.stringify(dbErr)}`);

    // OAuth token (with cache)
    const now = Date.now();
    if (!tokenCache || now >= tokenCache.expiresAt - 120000) {
      const bbRes = await fetch("https://bb-mtls-proxy-production.up.railway.app/oauth/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Deno.env.get("BB_BASIC_AUTH")}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "x-proxy-secret": Deno.env.get("PROXY_SECRET") ?? "",
        },
        body: "grant_type=client_credentials",
      });
      const bbData = await bbRes.json();
      tokenCache = {
        accessToken: bbData.access_token,
        expiresAt: now + bbData.expires_in * 1000,
      };
    }

    // Criar cobrança PIX
    const pixRes = await fetch(
      `https://bb-mtls-proxy-production.up.railway.app/pix/v2/cob/${txid}?gw-app-key=${Deno.env.get("BB_APP_KEY")}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${tokenCache.accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-proxy-secret": Deno.env.get("PROXY_SECRET") ?? "",
        },
        body: JSON.stringify({
          calendario: { expiracao: 600 },
          valor: { original: Number(body.valor).toFixed(2) },
          chave: Deno.env.get("BB_CHAVE_PIX_DESTINO"),
          solicitacaoPagador: "Doação APABB",
        }),
      }
    );

    if (!pixRes.ok) throw new Error(`BB API Error: ${await pixRes.text()}`);
    const pixData = await pixRes.json();

    // Buscar QR Code base64 do location
    let qrCodeBase64: string | null = null;
    if (pixData.loc?.location) {
      try {
        const qrRes = await fetch(
          `${pixData.loc.location}?gw-app-key=${Deno.env.get("BB_APP_KEY")}`,
          {
            headers: {
              Authorization: `Bearer ${tokenCache.accessToken}`,
              Accept: "application/json",
            },
          }
        );
        if (qrRes.ok) {
          const qrData = await qrRes.json();
          qrCodeBase64 = qrData.qrcode || null;
        }
      } catch (e) {
        console.warn("Could not fetch QR image:", e);
      }
    }

    // Atualizar banco com dados do PIX
    await supabase
      .from("pix_charges")
      .update({
        pix_copia_cola: pixData.pixCopiaECola,
        location: pixData.loc?.location || null,
      })
      .eq("txid", txid);

    return new Response(
      JSON.stringify({
        success: true,
        txid,
        pixCopiaECola: pixData.pixCopiaECola,
        location: pixData.loc?.location || null,
        qrCodeBase64,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});