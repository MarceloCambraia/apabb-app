import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", { action: body.action, type: body.type, dataId: body.data?.id });

    // Only process payment updates
    if (body.action !== "payment.updated" && body.action !== "payment.created") {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      console.error("No payment ID in webhook body");
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify payment status with Mercado Pago API
    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpAccessToken) {
      console.error("MP_ACCESS_TOKEN not configured");
      return new Response(JSON.stringify({ error: "Token not configured" }), {
        status: 200, // Return 200 to avoid retries
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpAccessToken}` },
    });

    if (!mpResponse.ok) {
      console.error("Failed to fetch payment from MP:", mpResponse.status);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentData = await mpResponse.json();
    const mpStatus = paymentData.status;
    console.log("Payment status from MP:", { paymentId: String(paymentId), status: mpStatus });

    // Map MP status to our status
    let newStatus: string | null = null;
    if (mpStatus === "approved") {
      newStatus = "paid";
    } else if (mpStatus === "cancelled" || mpStatus === "rejected") {
      newStatus = "failed";
    } else if (mpStatus === "refunded") {
      newStatus = "refunded";
    }

    if (!newStatus) {
      console.log("No status update needed for:", mpStatus);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update donation in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: updateData, error: updateError } = await supabase
      .from("donations")
      .update({ payment_status: newStatus })
      .eq("transaction_id", String(paymentId));

    if (updateError) {
      console.error("DB update error:", updateError.message);
    } else {
      console.log("Donation updated:", { paymentId: String(paymentId), newStatus });
    }

    return new Response(JSON.stringify({ received: true, updated: !updateError }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error instanceof Error ? error.message : "Unknown");
    // Always return 200 to prevent MP retries
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
