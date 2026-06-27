import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

function getBadgeLevel(amount: number): string {
  if (amount >= 100) return "anjo";
  if (amount >= 60) return "protetor";
  if (amount >= 40) return "parceiro";
  return "apoiador";
}

// Constant-time string comparison to avoid timing attacks
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

serve(async (req) => {
  // Always return 200 to prevent BB retry loops on processing errors,
  // but return 401 for authentication failures so attackers get no signal of success.
  const ok = () =>
    new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // --- Authentication: require shared secret ---
  // Configure the BB webhook URL with ?secret=... (or send X-Webhook-Secret header).
  const expectedSecret = Deno.env.get("BB_WEBHOOK_SECRET");
  if (!expectedSecret) {
    console.error("BB_WEBHOOK_SECRET not configured - rejecting all webhooks");
    return new Response(JSON.stringify({ error: "Webhook not configured" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const providedSecret =
    url.searchParams.get("secret") ||
    req.headers.get("x-webhook-secret") ||
    "";

  if (!providedSecret || !safeEqual(providedSecret, expectedSecret)) {
    console.warn("BB Webhook unauthorized request from", req.headers.get("x-forwarded-for") || "unknown");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    console.log("BB Webhook received (authenticated):", JSON.stringify(body));

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

      // Idempotency: only update charges that are still pending.
      // Returning no row means the charge was already processed (or doesn't exist).
      const { data: charge, error: chargeErr } = await supabase
        .from("pix_charges")
        .update({
          status: "paid",
          webhook_received_at: new Date().toISOString(),
        })
        .eq("txid", txid)
        .neq("status", "paid")
        .select("user_id, amount, nucleus, is_recurring")
        .maybeSingle();

      if (chargeErr) {
        console.error(`Error updating pix_charges for txid ${txid}:`, chargeErr);
        continue;
      }

      if (!charge) {
        console.warn(`No pending pix_charge found for txid: ${txid} (already processed or unknown)`);
        continue;
      }

      const isRecurring: boolean = charge.is_recurring ?? false;

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
            is_recurring: isRecurring,
          },
          { onConflict: "transaction_id" }
        );

        if (donErr) {
          console.error(`Error upserting donation for txid ${txid}:`, donErr);
        } else {
          console.log(`Donation marked as paid for txid: ${txid}, is_recurring: ${isRecurring}`);
        }

        // 3. If recurring, create/update subscription and profile badge
        if (isRecurring) {
          const badgeLevel = getBadgeLevel(Number(charge.amount));
          const today = new Date().toISOString().split("T")[0];
          const nextChargeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

          const { error: subErr } = await supabase.from("subscriptions").upsert(
            {
              user_id: charge.user_id,
              amount: charge.amount,
              payment_method: "pix_bb",
              status: "active",
              badge_level: badgeLevel,
              last_charge_date: today,
              next_charge_date: nextChargeDate,
            },
            { onConflict: "user_id" }
          );

          if (subErr) {
            console.error(`Error upserting subscription for user ${charge.user_id}:`, subErr);
          } else {
            console.log(`Subscription upserted for user ${charge.user_id}, badge: ${badgeLevel}`);
          }

          const { error: profileErr } = await supabase
            .from("profiles")
            .update({
              badge_level: badgeLevel,
              is_recurring_donor: true,
            })
            .eq("id", charge.user_id);

          if (profileErr) {
            console.error(`Error updating profile for user ${charge.user_id}:`, profileErr);
          } else {
            console.log(`Profile updated for user ${charge.user_id}, badge: ${badgeLevel}`);
          }
        }
      }
    }

    return ok();
  } catch (e) {
    console.error("Webhook processing error:", e);
    // Always return 200 on processing errors to avoid BB retry storms
    return ok();
  }
});
