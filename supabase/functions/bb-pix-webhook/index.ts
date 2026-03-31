import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Always return 200 to prevent BB retry loops
  const ok = () =>
    new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("BB Webhook received:", JSON.stringify(body));

    const pixArray = body?.pix;
    if (!Array.isArray(pixArray) || pixArray.length === 0) {
      console.warn("No pix array in webhook payload");
      return ok();
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    for (const pix of pixArray) {
      const txid = pix.txid;
      if (!txid) {
        console.warn("Pix entry without txid, skipping");
        continue;
      }

      console.log(`Processing txid: ${txid}, valor: ${pix.valor}`);

      // 1. Update pix_charges status to paid
      const { data: charge, error: chargeErr } = await supabase
        .from("pix_charges")
        .update({
          status: "paid",
          webhook_received_at: new Date().toISOString(),
        })
        .eq("txid", txid)
        .select("user_id, amount, nucleus")
        .maybeSingle();

      if (chargeErr) {
        console.error(`Error updating pix_charges for txid ${txid}:`, chargeErr);
        continue;
      }

      if (!charge) {
        console.warn(`No pix_charge found for txid: ${txid}`);
        continue;
      }

      // 2. Upsert donation record as paid
      if (charge.user_id) {
        const { error: donErr } = await supabase.from("donations").upsert(
          {
            user_id: charge.user_id,
            amount: charge.amount,
            nucleus: charge.nucleus || "Nacional",
            payment_method: "pix_bb",
            payment_status: "paid",
            transaction_id: txid,
            is_recurring: false,
          },
          { onConflict: "transaction_id" }
        );

        if (donErr) {
          console.error(`Error upserting donation for txid ${txid}:`, donErr);
        } else {
          console.log(`Donation marked as paid for txid: ${txid}`);
        }
      }
    }

    return ok();
  } catch (e) {
    console.error("Webhook processing error:", e);
    // Always return 200
    return ok();
  }
});
