import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import QRCode from "https://esm.sh/qrcode@1.5.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RequestBody {
  valor: number;
  userId?: string;
  nucleus?: string;
  donorName?: string;
  email?: string;
  cpf?: string;
}

async function getOAuthToken(basicAuth: string): Promise<string> {
  const response = await fetch("https://oauth.hm.bb.com.br/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      // Use explicit Headers object to prevent charset appending
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OAuth error:", response.status, errorText);
    throw new Error(`Falha na autenticação OAuth: ${response.status}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Token de acesso não retornado pelo BB");
  }

  console.log("OAuth token obtained successfully");
  return data.access_token;
}

async function createPixCharge(
  accessToken: string,
  appKey: string,
  chavePixDestino: string,
  valor: number
): Promise<{ txid: string; pixCopiaECola: string }> {
  const txid = crypto.randomUUID().replace(/-/g, "").substring(0, 32);
  const valorFormatado = valor.toFixed(2);

  const endpoint = `https://api.hm.bb.com.br/pix/v2/cob/${txid}?gw-dev-app-key=${appKey}`;

  const payload = {
    calendario: { expiracao: 3600 },
    valor: { original: valorFormatado },
    chave: chavePixDestino,
    solicitacaoPagador: "Doação para APABB",
  };

  console.log("Creating PIX charge with txid:", txid);

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PIX charge error:", response.status, errorText);
    throw new Error(`Falha API Pix BB: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("PIX charge created successfully:", { txid, status: data.status });

  const pixCopiaECola = data.pixCopiaECola;
  if (!pixCopiaECola) {
    throw new Error("pixCopiaECola não retornado na resposta do BB");
  }

  return { txid, pixCopiaECola };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bbAppKey = Deno.env.get("BB_APP_KEY");
    const bbBasicAuth = Deno.env.get("BB_BASIC_AUTH");
    const bbChavePix = Deno.env.get("BB_CHAVE_PIX_DESTINO");

    if (!bbAppKey || !bbBasicAuth || !bbChavePix) {
      console.error("Missing BB credentials");
      return new Response(
        JSON.stringify({ success: false, error: "Serviço de pagamento não configurado" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    const { valor, userId, nucleus, donorName, email } = body;

    if (!valor || valor < 1) {
      return new Response(
        JSON.stringify({ success: false, error: "Valor inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: OAuth token
    const accessToken = await getOAuthToken(bbBasicAuth);

    // Step 2: Create PIX charge
    const { txid, pixCopiaECola } = await createPixCharge(
      accessToken,
      bbAppKey,
      bbChavePix,
      valor
    );

    // Step 3: Generate QR Code as Base64
    const qrCodeBase64: string = await QRCode.toDataURL(pixCopiaECola, {
      type: "image/png",
      width: 300,
      margin: 2,
    });
    // Remove "data:image/png;base64," prefix
    const base64Only = qrCodeBase64.replace(/^data:image\/png;base64,/, "");

    // Step 4: Record donation in database
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error: dbError } = await supabase.from("donations").insert({
        user_id: userId,
        amount: valor,
        is_recurring: false,
        nucleus: nucleus || "Nacional",
        payment_method: "pix_bb",
        payment_status: "pending",
        transaction_id: txid,
      });

      if (dbError) {
        console.error("DB insert error:", dbError);
        // Don't fail the whole flow, PIX was already created
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        qr_code_base64: base64Only,
        qr_code: pixCopiaECola,
        txid,
        mp_transaction_id: txid, // keep compat with frontend field name
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro interno ao processar pagamento PIX",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
