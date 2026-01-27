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

interface GatewayResponse {
  success: boolean;
  transactionId?: string;
  status?: string;
  message?: string;
  errorCode?: string;
}

// Sanitiza erros para não expor dados sensíveis nos logs
function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Remove qualquer token ou chave que possa estar na mensagem de erro
    return error.message
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, "Bearer [REDACTED]")
      .replace(/sk_[a-zA-Z0-9_]+/g, "[REDACTED_KEY]")
      .replace(/pk_[a-zA-Z0-9_]+/g, "[REDACTED_KEY]");
  }
  return "Erro desconhecido";
}

// Processa pagamento via cartão de crédito
async function processCreditCardPayment(
  payload: DonationPayload,
  gatewaySecretKey: string
): Promise<{ status: string; reference: string | null; error?: string }> {
  const gatewayEndpoint = Deno.env.get("GATEWAY_API_ENDPOINT") || "https://api.gateway.example.com/v1/charges";
  
  try {
    console.log("Initiating credit card payment processing...");
    
    // Preparar dados para o gateway (estrutura genérica)
    const gatewayPayload = {
      amount: Math.round(payload.amount * 100), // Convertendo para centavos
      currency: "BRL",
      payment_method: "credit_card",
      card: {
        number: payload.paymentDetails.cardNumber,
        holder_name: payload.paymentDetails.cardName,
        expiration_month: payload.paymentDetails.cardExpMonth,
        expiration_year: payload.paymentDetails.cardExpYear,
        cvv: payload.paymentDetails.cardCvv,
      },
      customer: {
        name: payload.donor.fullName,
        email: payload.donor.email,
        document: payload.donor.cpfCnpj.replace(/\D/g, ""),
        phone: payload.donor.phone.replace(/\D/g, ""),
      },
      billing: {
        address: payload.address.address,
        number: payload.address.number,
        complement: payload.address.complement || "",
        neighborhood: payload.address.neighborhood,
        city: payload.address.city,
        state: payload.address.state,
        zip_code: payload.address.cep.replace(/\D/g, ""),
        country: "BR",
      },
      metadata: {
        is_recurring: payload.isRecurring,
        source: "apabb_donation_portal",
      },
    };

    const response = await fetch(gatewayEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${gatewaySecretKey}`,
        "Accept": "application/json",
      },
      body: JSON.stringify(gatewayPayload),
    });

    const gatewayResponse: GatewayResponse = await response.json();

    if (!response.ok || !gatewayResponse.success) {
      console.error("Gateway error:", {
        statusCode: response.status,
        errorCode: gatewayResponse.errorCode,
        // Não logar a mensagem completa que pode conter dados sensíveis
      });
      
      return {
        status: "failed",
        reference: null,
        error: gatewayResponse.message || "Falha no processamento do pagamento",
      };
    }

    console.log("Credit card payment processed successfully:", {
      transactionId: gatewayResponse.transactionId,
      status: gatewayResponse.status,
    });

    return {
      status: gatewayResponse.status || "approved",
      reference: gatewayResponse.transactionId || `CC-${Date.now()}`,
    };

  } catch (error) {
    console.error("Credit card processing error:", sanitizeError(error));
    return {
      status: "error",
      reference: null,
      error: "Erro de comunicação com o gateway de pagamento",
    };
  }
}

// Processa débito em conta BB
async function processDebitBB(
  payload: DonationPayload,
  gatewaySecretKey: string
): Promise<{ status: string; reference: string | null; error?: string }> {
  const bbEndpoint = Deno.env.get("BB_API_ENDPOINT") || "https://api.bb.com.br/v1/debit-authorization";
  
  try {
    console.log("Initiating BB debit authorization...");
    
    const debitPayload = {
      amount: Math.round(payload.amount * 100),
      agency: payload.paymentDetails.agency,
      account: payload.paymentDetails.account,
      customer: {
        name: payload.donor.fullName,
        document: payload.donor.cpfCnpj.replace(/\D/g, ""),
      },
      is_recurring: payload.isRecurring,
    };

    const response = await fetch(bbEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${gatewaySecretKey}`,
        "Accept": "application/json",
      },
      body: JSON.stringify(debitPayload),
    });

    const gatewayResponse: GatewayResponse = await response.json();

    if (!response.ok || !gatewayResponse.success) {
      console.error("BB Debit error:", {
        statusCode: response.status,
        errorCode: gatewayResponse.errorCode,
      });
      
      return {
        status: "failed",
        reference: null,
        error: gatewayResponse.message || "Falha na autorização de débito",
      };
    }

    return {
      status: gatewayResponse.status || "pending_authorization",
      reference: gatewayResponse.transactionId || `BB-${Date.now()}`,
    };

  } catch (error) {
    console.error("BB debit processing error:", sanitizeError(error));
    return {
      status: "error",
      reference: null,
      error: "Erro de comunicação com o Banco do Brasil",
    };
  }
}

// Gera boleto
async function generateBoleto(
  payload: DonationPayload,
  gatewaySecretKey: string
): Promise<{ status: string; reference: string | null; boletoUrl?: string; error?: string }> {
  const boletoEndpoint = Deno.env.get("BOLETO_API_ENDPOINT") || "https://api.gateway.example.com/v1/boletos";
  
  try {
    console.log("Generating boleto...");
    
    const boletoPayload = {
      amount: Math.round(payload.amount * 100),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 dias
      customer: {
        name: payload.donor.fullName,
        email: payload.donor.email,
        document: payload.donor.cpfCnpj.replace(/\D/g, ""),
      },
      billing_address: {
        address: payload.address.address,
        number: payload.address.number,
        neighborhood: payload.address.neighborhood,
        city: payload.address.city,
        state: payload.address.state,
        zip_code: payload.address.cep.replace(/\D/g, ""),
      },
    };

    const response = await fetch(boletoEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${gatewaySecretKey}`,
        "Accept": "application/json",
      },
      body: JSON.stringify(boletoPayload),
    });

    const gatewayResponse = await response.json();

    if (!response.ok || !gatewayResponse.success) {
      console.error("Boleto generation error:", {
        statusCode: response.status,
        errorCode: gatewayResponse.errorCode,
      });
      
      return {
        status: "failed",
        reference: null,
        error: gatewayResponse.message || "Falha na geração do boleto",
      };
    }

    return {
      status: "pending_payment",
      reference: gatewayResponse.transactionId || `BOL-${Date.now()}`,
      boletoUrl: gatewayResponse.boleto_url,
    };

  } catch (error) {
    console.error("Boleto generation error:", sanitizeError(error));
    return {
      status: "error",
      reference: null,
      error: "Erro ao gerar boleto",
    };
  }
}

// Processa desconto em folha
async function processPayrollDeduction(
  payload: DonationPayload
): Promise<{ status: string; reference: string | null; error?: string }> {
  // Desconto em folha requer aprovação manual e integração com RH do BB
  console.log("Registering payroll deduction request...");
  
  return {
    status: "pending_payroll_approval",
    reference: `PAY-${Date.now()}`,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const gatewaySecretKey = Deno.env.get("GATEWAY_SECRET_KEY");
    
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
        JSON.stringify({ 
          success: false,
          error: "Valor da doação inválido",
          code: "INVALID_AMOUNT"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.donor.email || !payload.donor.fullName) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Dados do doador incompletos",
          code: "INCOMPLETE_DONOR_DATA"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se a chave do gateway está configurada (exceto para payroll)
    if (!gatewaySecretKey && payload.paymentMethod !== "payroll") {
      console.error("Gateway secret key not configured");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Serviço de pagamento temporariamente indisponível",
          code: "GATEWAY_NOT_CONFIGURED"
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let paymentStatus = "pending";
    let paymentReference: string | null = null;
    let paymentError: string | undefined;
    let additionalData: Record<string, unknown> = {};

    // Processar baseado no método de pagamento
    switch (payload.paymentMethod) {
      case "credit_card": {
        const result = await processCreditCardPayment(payload, gatewaySecretKey!);
        paymentStatus = result.status;
        paymentReference = result.reference;
        paymentError = result.error;
        break;
      }

      case "debit_bb": {
        const result = await processDebitBB(payload, gatewaySecretKey!);
        paymentStatus = result.status;
        paymentReference = result.reference;
        paymentError = result.error;
        break;
      }

      case "boleto": {
        const result = await generateBoleto(payload, gatewaySecretKey!);
        paymentStatus = result.status;
        paymentReference = result.reference;
        paymentError = result.error;
        if (result.boletoUrl) {
          additionalData.boletoUrl = result.boletoUrl;
        }
        break;
      }

      case "payroll": {
        const result = await processPayrollDeduction(payload);
        paymentStatus = result.status;
        paymentReference = result.reference;
        paymentError = result.error;
        break;
      }
    }

    // Se houve erro no processamento do pagamento
    if (paymentError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: paymentError,
          code: "PAYMENT_PROCESSING_ERROR",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
          JSON.stringify({ 
            success: false,
            error: "Erro ao registrar doação",
            code: "DATABASE_ERROR"
          }),
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
      instructions: getPaymentInstructions(payload.paymentMethod, paymentReference),
      ...additionalData,
    };

    console.log("Donation processed successfully:", {
      paymentStatus,
      paymentReference,
      amount: payload.amount,
    });

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing donation:", sanitizeError(error));
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Erro interno ao processar doação. Tente novamente.",
        code: "INTERNAL_ERROR"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getPaymentInstructions(method: string, reference: string | null): string {
  switch (method) {
    case "credit_card":
      return "Seu pagamento foi processado. Você receberá uma confirmação por e-mail.";
    case "debit_bb":
      return "Autorização de débito enviada. Confirme no seu aplicativo do Banco do Brasil.";
    case "boleto":
      return `Seu boleto foi gerado (Ref: ${reference}). Você receberá o boleto por e-mail em instantes.`;
    case "payroll":
      return "Sua solicitação de desconto em folha foi registrada. Aguarde a aprovação do RH.";
    default:
      return "Doação registrada com sucesso.";
  }
}
