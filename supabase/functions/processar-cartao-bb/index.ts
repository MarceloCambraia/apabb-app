import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

let tokenCache: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && now < tokenCache.expiresAt - 120000) {
    return tokenCache.accessToken;
  }

  const res = await fetch("https://oauth.bb.com.br/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Deno.env.get("BB_BASIC_AUTH")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=bbpay.pagamentos",
  });

  if (!res.ok) {
    throw new Error(`OAuth Error: ${await res.text()}`);
  }
  const data = await res.json();
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return data.access_token;
}

function detectBrand(num: string): string {
  const n = num.replace(/\D/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Master";
  if (/^(4011|4312|4389|4514|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(n)) return "Elo";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^(606282|3841)/.test(n)) return "Hipercard";
  return "Outros";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid Token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const user = userData.user;

    const body = await req.json();
    const { valor, cartao, pagador } = body;

    if (!valor || valor <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Valor inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!cartao?.numero || !cartao?.validade || !cartao?.cvv || !cartao?.nome) {
      return new Response(
        JSON.stringify({ success: false, error: "Dados do cartão incompletos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!pagador?.nome || !pagador?.cpf) {
      return new Response(
        JSON.stringify({ success: false, error: "Dados do pagador incompletos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appKey = Deno.env.get("BB_APP_KEY")!;
    if (!appKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Configuração BB ausente" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const numClean = cartao.numero.replace(/\D/g, "");
    const cpfClean = pagador.cpf.replace(/\D/g, "");
    const lastFour = numClean.slice(-4);
    const brand = detectBrand(numClean);
    const [mes, ano] = cartao.validade.split("/").map((v: string) => v.trim());

    // Pre-insert (NEVER store full card data)
    const { data: inserted, error: dbErr } = await supabase
      .from("card_payments")
      .insert({
        user_id: user.id,
        amount: valor,
        status: "pending",
        card_last_four: lastFour,
        card_brand: brand,
        pagador_nome: pagador.nome,
        pagador_cpf: cpfClean,
      })
      .select()
      .single();

    if (dbErr || !inserted) {
      throw new Error(`DB Insert Error: ${JSON.stringify(dbErr)}`);
    }

    const accessToken = await getAccessToken();

    const bbBody = {
      valor: Number(Number(valor).toFixed(2)),
      moeda: "BRL",
      descricao: "Doação APABB",
      cartao: {
        numero: numClean,
        nomePortador: cartao.nome.substring(0, 60),
        mesValidade: Number(mes),
        anoValidade: Number(ano.length === 2 ? `20${ano}` : ano),
        codigoSeguranca: cartao.cvv.replace(/\D/g, ""),
      },
      pagador: {
        nome: pagador.nome.substring(0, 60),
        tipoInscricao: cpfClean.length === 11 ? 1 : 2,
        numeroInscricao: cpfClean,
      },
    };

    const bbRes = await fetch(
      `https://api.bb.com.br/bbpay/v2/pagamentos?gw-app-key=${appKey}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(bbBody),
      }
    );

    const bbText = await bbRes.text();
    let bbData: any = {};
    try { bbData = JSON.parse(bbText); } catch { bbData = { raw: bbText }; }

    // Redact any sensitive echo before storing
    if (bbData?.cartao) delete bbData.cartao;

    if (!bbRes.ok) {
      const errMsg = bbData?.message || bbData?.erro || bbData?.errors?.[0]?.message || "Pagamento recusado";
      await supabase
        .from("card_payments")
        .update({
          status: "declined",
          error_message: errMsg,
          bb_response: bbData,
        })
        .eq("id", inserted.id);

      return new Response(
        JSON.stringify({
          success: false,
          status: "declined",
          message: errMsg,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const status = bbData.status || bbData.situacao || "approved";
    const isApproved = ["approved", "aprovado", "APROVADO", "AUTORIZADO"].includes(String(status));
    const authCode = bbData.codigoAutorizacao || bbData.authorizationCode || bbData.id || null;

    await supabase
      .from("card_payments")
      .update({
        status: isApproved ? "approved" : "declined",
        authorization_code: authCode,
        bb_response: bbData,
        error_message: isApproved ? null : (bbData?.message || "Pagamento não autorizado"),
      })
      .eq("id", inserted.id);

    return new Response(
      JSON.stringify({
        success: isApproved,
        status: isApproved ? "approved" : "declined",
        authorizationCode: authCode,
        message: isApproved ? "Pagamento aprovado" : (bbData?.message || "Pagamento não autorizado"),
        cardLastFour: lastFour,
        cardBrand: brand,
        amount: valor,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Card payment error:", e?.message || e);
    return new Response(
      JSON.stringify({ success: false, error: e.message || "Erro ao processar pagamento" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
