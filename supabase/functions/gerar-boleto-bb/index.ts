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
    body: "grant_type=client_credentials&scope=cobrancas.boletos-info cobrancas.boletos-requisicao",
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

/** Generate next business day + N days, skipping weekends */
function calcDueDate(businessDays: number): Date {
  const d = new Date();
  let added = 0;
  while (added < businessDays) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

function formatDateBR(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function formatDateISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Generate unique nosso numero: convenio (10 digits) + sequential (10 digits) */
function generateNossoNumero(convenio: string): string {
  const conv = convenio.padStart(10, "0").slice(-10);
  const seq = String(Date.now()).slice(-10).padStart(10, "0");
  return `${conv}${seq}`;
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
    if (!pagador?.nome || !pagador?.cpf || !pagador?.endereco) {
      return new Response(
        JSON.stringify({ success: false, error: "Dados do pagador incompletos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const convenio = Deno.env.get("BB_NUMERO_CONVENIO")!;
    const carteira = Deno.env.get("BB_NUMERO_CARTEIRA") || "17";
    const variacao = Deno.env.get("BB_NUMERO_VARIACAO_CARTEIRA") || "35";
    const appKey = Deno.env.get("BB_APP_KEY")!;

    if (!convenio || !appKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Configuração BB ausente" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dueDate = calcDueDate(3);
    const nossoNumero = generateNossoNumero(convenio);
    const cpfClean = pagador.cpf.replace(/\D/g, "");
    const cepClean = (pagador.endereco.cep || "").replace(/\D/g, "");

    // Insert intent in DB
    const { error: dbErr } = await supabase.from("boleto_charges").insert({
      user_id: user.id,
      amount: valor,
      status: "pending",
      numero_convenio: convenio,
      nosso_numero: nossoNumero,
      pagador_nome: pagador.nome,
      pagador_cpf: cpfClean,
      pagador_endereco: pagador.endereco,
      due_date: formatDateISO(dueDate),
    });
    if (dbErr) {
      throw new Error(`DB Insert Error: ${JSON.stringify(dbErr)}`);
    }

    const accessToken = await getAccessToken();

    // BB Cobrancas v2 - Registrar Boleto
    const bbBody = {
      numeroConvenio: Number(convenio),
      numeroCarteira: Number(carteira),
      numeroVariacaoCarteira: Number(variacao),
      codigoModalidade: 1,
      dataEmissao: formatDateBR(new Date()),
      dataVencimento: formatDateBR(dueDate),
      valorOriginal: Number(Number(valor).toFixed(2)),
      codigoAceite: "N",
      codigoTipoTitulo: 2,
      descricaoTipoTitulo: "DM",
      indicadorPermissaoRecebimentoParcial: "N",
      numeroTituloBeneficiario: nossoNumero.slice(-10),
      numeroTituloCliente: `000${convenio.padStart(7, "0")}${nossoNumero.slice(-10)}`,
      pagador: {
        tipoInscricao: cpfClean.length === 11 ? 1 : 2,
        numeroInscricao: Number(cpfClean),
        nome: pagador.nome.substring(0, 60),
        endereco: (pagador.endereco.address || "").substring(0, 60),
        cep: Number(cepClean),
        cidade: pagador.endereco.city || "",
        bairro: (pagador.endereco.neighborhood || "").substring(0, 30),
        uf: pagador.endereco.state || "",
      },
    };

    const bbRes = await fetch(
      `https://api.bb.com.br/cobrancas/v2/boletos?gw-app-key=${appKey}`,
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
    if (!bbRes.ok) {
      await supabase
        .from("boleto_charges")
        .update({ status: "error", bb_response: { error: bbText } })
        .eq("nosso_numero", nossoNumero);
      throw new Error(`BB API Error: ${bbText}`);
    }

    const bbData = JSON.parse(bbText);

    const linhaDigitavel = bbData.linhaDigitavel || bbData.numeroLinhaDigitavel || null;
    const codigoBarras = bbData.codigoBarraNumerico || bbData.codigoBarras || null;
    const pdfUrl = bbData.qrCode?.url || bbData.urlPdf || null;

    await supabase
      .from("boleto_charges")
      .update({
        linha_digitavel: linhaDigitavel,
        codigo_barras: codigoBarras,
        pdf_url: pdfUrl,
        bb_response: bbData,
      })
      .eq("nosso_numero", nossoNumero);

    return new Response(
      JSON.stringify({
        success: true,
        nossoNumero,
        linhaDigitavel,
        codigoBarras,
        pdfUrl,
        dueDate: formatDateISO(dueDate),
        amount: valor,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Boleto error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
