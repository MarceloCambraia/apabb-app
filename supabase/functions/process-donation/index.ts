import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DonationPayload {
  amount: number;
  paymentMethod: "debit_bb" | "credit_card" | "boleto" | "payroll";
  isRecurring: boolean;
  donor: {
    fullName: string;
    cpfCnpj: string;
    birthDate: string;
    gender: string;
    email: string;
    phone: string;
  };
  address: {
    cep: string;
    address: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  paymentDetails: Record<string, string>;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: DonationPayload = await req.json();

    console.log("Processing donation:", {
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
      isRecurring: payload.isRecurring,
      donorEmail: payload.donor.email,
      userId: payload.userId,
    });

    // Validar dados obrigatórios
    if (!payload.amount || payload.amount < 1) {
      return new Response(
        JSON.stringify({ error: "Valor da doação inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.donor.email || !payload.donor.fullName) {
      return new Response(
        JSON.stringify({ error: "Dados do doador incompletos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // IMPORTANTE: Dados sensíveis do cartão NUNCA são armazenados no banco
    // Aqui você integraria com um gateway de pagamento (ex: Stripe, PagSeguro, etc.)
    // Os dados do cartão são processados apenas em memória e enviados ao gateway
    
    let paymentStatus = "pending";
    let paymentReference = null;

    // Simular processamento baseado no método de pagamento
    switch (payload.paymentMethod) {
      case "credit_card":
        // NUNCA logar dados do cartão - apenas para demonstração
        console.log("Processing credit card payment (card data not logged for security)");
        // Aqui você chamaria o gateway de pagamento
        // const stripeResult = await stripe.charges.create({ ... });
        paymentStatus = "processing";
        paymentReference = `CC-${Date.now()}`;
        break;

      case "debit_bb":
        console.log("Processing BB debit authorization");
        // Integração com Banco do Brasil para débito em conta
        paymentStatus = "pending_authorization";
        paymentReference = `BB-${Date.now()}`;
        break;

      case "boleto":
        console.log("Generating boleto");
        // Gerar boleto via gateway
        paymentStatus = "pending_payment";
        paymentReference = `BOL-${Date.now()}`;
        break;

      case "payroll":
        console.log("Processing payroll deduction request");
        // Consignado na folha de pagamento BB
        paymentStatus = "pending_payroll";
        paymentReference = `PAY-${Date.now()}`;
        break;
    }

    // Determinar o núcleo baseado no estado do doador
    const nucleusMap: Record<string, string> = {
      SP: "São Paulo",
      RJ: "Rio de Janeiro",
      MG: "Belo Horizonte",
      BA: "Salvador",
      RS: "Porto Alegre",
      PR: "Curitiba",
      PE: "Recife",
      CE: "Fortaleza",
      DF: "Brasília",
      GO: "Goiânia",
      PA: "Belém",
      SC: "Florianópolis",
      ES: "Vitória",
      AM: "Manaus",
      MT: "Cuiabá",
    };
    
    const nucleus = nucleusMap[payload.address.state] || "Nacional";

    // Registrar doação no banco de dados (sem dados sensíveis)
    if (payload.userId) {
      const { data: donation, error: donationError } = await supabase
        .from("donations")
        .insert({
          user_id: payload.userId,
          amount: payload.amount,
          is_recurring: payload.isRecurring,
          nucleus: nucleus,
          payment_method: payload.paymentMethod,
          payment_status: paymentStatus,
        })
        .select()
        .single();

      if (donationError) {
        console.error("Error inserting donation:", donationError);
        return new Response(
          JSON.stringify({ error: "Erro ao registrar doação" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Donation recorded:", donation.id);
    }

    // Resposta de sucesso
    const response = {
      success: true,
      message: "Doação processada com sucesso",
      paymentStatus,
      paymentReference,
      amount: payload.amount,
      isRecurring: payload.isRecurring,
      // Instruções baseadas no método de pagamento
      instructions: getPaymentInstructions(payload.paymentMethod, paymentReference),
    };

    console.log("Donation processed successfully:", response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing donation:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno ao processar doação" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getPaymentInstructions(method: string, reference: string | null): string {
  switch (method) {
    case "credit_card":
      return "Seu pagamento está sendo processado. Você receberá uma confirmação por e-mail.";
    case "debit_bb":
      return "Autorização de débito enviada. Confirme no seu aplicativo do Banco do Brasil.";
    case "boleto":
      return `Seu boleto foi gerado (Ref: ${reference}). Você receberá o boleto por e-mail.`;
    case "payroll":
      return "Sua solicitação de desconto em folha foi registrada. Aguarde a aprovação.";
    default:
      return "Doação registrada com sucesso.";
  }
}
