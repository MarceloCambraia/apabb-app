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

  console.log("OAuth attempt without scope");
  const res = await fetch("https://oauth.bb.com.br/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Deno.env.get("BB_BASIC_AUTH")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString(),
  });

  const rawText = await res.text();
  console.log("OAuth response status:", res.status);
  console.log("OAuth response body:", rawText);

  if (!res.ok) {
    throw new Error(`OAuth Error (${res.status}): ${rawText}`);
  }
  let data: any;
  try { data = JSON.parse(rawText); } catch { throw new Error(`OAuth parse error: ${rawText}`); }

  console.log("OAuth scopes granted:", data.scope ?? "(none returned)");
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return data.access_token;
}

function gerarTxid(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `APABB${ts}${rand}`;
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
    const { valor, pagador } = body;

    if (!valor || valor <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Valor inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!pagador?.nome || !pagador?.cpf) {
      return new Response(
        JSON.stringify({ success: false, error: "Dados do pagador incompletos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appKey = Deno.env.get("BB_APP_KEY");
    if (!appKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Configuração BB ausente" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const numeroConvenio = Number(Deno.env.get("BB_NUMERO_CONVENIO_BBPAY") ?? "152306");
    const cpfClean = pagador.cpf.replace(/\D/g, "");
    const txid = gerarTxid();

    // Pre-insert do registro de pagamento
    const { data: inserted, error: dbErr } = await supabase
      .from("card_payments")
      .insert({
        user_id: user.id,
        amount: valor,
        status: "pending",
        card_last_four: "0000",
        card_brand: "BBPAY",
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
      numeroConvenio,
      pagamentoUnico: true,
      valorSolicitacao: Number(Number(valor).toFixed(2)),
      descricaoSolicitacaoPagamento: "Doação APABB",
      codigoConciliacaoSolicitacao: txid,
      urlRetorno: "https://apabb-together.lovable.app/doar",
      devedor: {
        tipoDocumentoPagador: 1,
        numeroDocumentoPagador: cpfClean,
        nome: pagador.nome.substring(0, 60),
      },
      formasPagamento: [
        { codigoTipoPagamento: "PIX", quantidadeParcelas: 1 },
        { codigoTipoPagamento: "EC3", quantidadeParcelas: 1 },
      ],
    };

    const bbRes = await fetch(
      `https://api.bb.com.br/bbpay/v2/solicitacoes?gw-app-key=${appKey}`,
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

    if (!bbRes.ok) {
      const errMsg =
        bbData?.message ||
        bbData?.erro ||
        bbData?.errors?.[0]?.message ||
        "Erro ao criar solicitação BB Pay";

      await supabase
        .from("card_payments")
        .update({ status: "declined", error_message: errMsg, bb_response: bbData })
        .eq("id", inserted.id);

      return new Response(
        JSON.stringify({ success: false, status: "declined", message: errMsg }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const urlSolicitacao: string = bbData.urlSolicitacao ?? "";
    const numeroSolicitacao: number = bbData.numeroSolicitacao ?? 0;
    const qrCode: string | undefined = bbData.informacoesPix?.textoQrCode;

    await supabase
      .from("card_payments")
      .update({
        status: "pending_payment",
        authorization_code: String(numeroSolicitacao),
        bb_response: bbData,
      })
      .eq("id", inserted.id);

    return new Response(
      JSON.stringify({
        success: true,
        urlSolicitacao,
        numeroSolicitacao,
        ...(qrCode ? { qrCode } : {}),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("BBPay solicitacao error:", e?.message || e);
    return new Response(
      JSON.stringify({ success: false, error: e.message || "Erro ao criar solicitação de pagamento" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
