import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpAccessToken) {
      console.error("MP_ACCESS_TOKEN not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Serviço PIX temporariamente indisponível. Token não configurado.",
          code: "PIX_NOT_CONFIGURED",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { amount, email, userId, description } = await req.json();

    // Validate
    if (!amount || amount < 1) {
      return new Response(
        JSON.stringify({ success: false, error: "Valor inválido", code: "INVALID_AMOUNT" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payerEmail = email || "test_user_doacao@testuser.com";

    console.log("Creating PIX payment:", { amount, payerEmail });

    // Call Mercado Pago API
    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpAccessToken}`,
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        description: description || "Doação APABB",
        payment_method_id: "pix",
        payer: {
          email: payerEmail,
        },
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", {
        status: mpResponse.status,
        message: mpData.message,
        cause: mpData.cause,
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: mpData.message || "Erro ao gerar PIX",
          code: "MP_ERROR",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transactionData = mpData.point_of_interaction?.transaction_data;
    const qrCodeBase64 = transactionData?.qr_code_base64 || null;
    const qrCode = transactionData?.qr_code || null;
    const mpTransactionId = String(mpData.id);

    console.log("PIX payment created:", {
      mpId: mpTransactionId,
      status: mpData.status,
      hasQrCode: !!qrCodeBase64,
    });

    // Save donation to database with transaction_id for webhook matching
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error: dbError } = await supabase.from("donations").insert({
        user_id: userId,
        amount: Number(amount),
        is_recurring: false,
        nucleus: "Nacional",
        payment_method: "pix",
        payment_status: "pending",
        transaction_id: mpTransactionId,
      });

      if (dbError) {
        console.error("DB insert error:", dbError.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        qr_code_base64: qrCodeBase64,
        qr_code: qrCode,
        mp_transaction_id: mpTransactionId,
        status: mpData.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PIX error:", error instanceof Error ? error.message : "Unknown error");
    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro interno ao gerar PIX",
        code: "INTERNAL_ERROR",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
