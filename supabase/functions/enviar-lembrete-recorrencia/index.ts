import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Buscar assinaturas ativas que vencem em 3 dias
    // e que ainda não receberam lembrete hoje
    const hoje = new Date();
    const em3dias = new Date(hoje);
    em3dias.setDate(hoje.getDate() + 3);
    const em3diasStr = em3dias.toISOString().split("T")[0];

    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select(`
        id,
        user_id,
        amount,
        badge_level,
        next_charge_date,
        reminder_sent_at
      `)
      .eq("status", "active")
      .eq("next_charge_date", em3diasStr)
      .or(
        "reminder_sent_at.is.null,reminder_sent_at.lt." +
          new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      );

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "Nenhum lembrete para enviar" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    const errors: { user_id: string; error: string }[] = [];

    for (const sub of subscriptions) {
      try {
        // Buscar email e nome do usuário
        const { data: userData } = await supabase.auth.admin.getUserById(sub.user_id);
        const email = userData?.user?.email;
        if (!email) continue;

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", sub.user_id)
          .single();

        const nome = profile?.full_name?.split(" ")[0] || "Doador";
        const valor = Number(sub.amount).toFixed(2).replace(".", ",");
        const vencimento = new Date(sub.next_charge_date + "T12:00:00").toLocaleDateString("pt-BR");

        const badgeEmoji: Record<string, string> = {
          apoiador: "🤝",
          parceiro: "⭐",
          protetor: "🛡️",
          anjo: "😇",
        };

        const badgeNome: Record<string, string> = {
          apoiador: "Apoiador",
          parceiro: "Parceiro",
          protetor: "Protetor",
          anjo: "Anjo",
        };

        const emoji = badgeEmoji[sub.badge_level] || "💙";
        const nivelNome = badgeNome[sub.badge_level] || sub.badge_level;

        // Enviar e-mail via Resend
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "APABB <onboarding@resend.dev>",
            to: [email],
            subject: `Lembrete: sua doação mensal vence em 3 dias`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #1A5276; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">APABB</h1>
                  <p style="color: #AED6F1; margin: 6px 0 0 0; font-size: 14px;">Transformando vidas</p>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
                  <h2 style="color: #1A5276; margin-top: 0;">
                    ${emoji} Olá, ${nome}!
                  </h2>
                  <p style="color: #333; font-size: 16px;">
                    Sua doação mensal como <strong>${nivelNome}</strong> vence em
                    <strong>3 dias (${vencimento})</strong>.
                  </p>
                  <div style="background: #EAF2F8; border-left: 4px solid #1A5276; padding: 16px; margin: 24px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #1A5276; font-size: 18px; font-weight: bold;">
                      Valor: R$ ${valor}
                    </p>
                    <p style="margin: 4px 0 0 0; color: #555; font-size: 14px;">
                      Nível: ${emoji} ${nivelNome}
                    </p>
                  </div>
                  <p style="color: #333;">
                    Clique no botão abaixo para realizar sua doação e manter seu nível ativo:
                  </p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="https://apabb-together.lovable.app/doar"
                       style="background-color: #F39C12; color: white; padding: 14px 32px;
                              text-decoration: none; border-radius: 6px; font-size: 16px;
                              font-family: Arial, sans-serif; display: inline-block; font-weight: bold;">
                      💙 Fazer minha doação
                    </a>
                  </div>
                  <p style="color: #555; font-size: 14px;">
                    Sua contribuição é fundamental para que a APABB continue
                    promovendo a inclusão de pessoas com deficiência em todo o Brasil.
                  </p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                  <p style="color: #aaa; font-size: 11px; text-align: center; margin: 0;">
                    APABB – Associação de Pais, Amigos e Pessoas com Deficiência<br>
                    de Funcionários do Banco do Brasil<br>
                    <a href="mailto:contato@apabb.org.br" style="color: #aaa;">contato@apabb.org.br</a>
                  </p>
                </div>
              </div>
            `,
          }),
        });

        if (resendRes.ok) {
          await supabase
            .from("subscriptions")
            .update({ reminder_sent_at: new Date().toISOString() })
            .eq("id", sub.id);
          sent++;
          console.log(`Reminder sent to ${email} for subscription ${sub.id}`);
        } else {
          const err = await resendRes.text();
          errors.push({ user_id: sub.user_id, error: err });
          console.error(`Failed to send reminder to ${email}:`, err);
        }
      } catch (e: any) {
        errors.push({ user_id: sub.user_id, error: e.message });
        console.error(`Error processing subscription ${sub.id}:`, e.message);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Fatal error:", e.message);
    return new Response(
      JSON.stringify({ success: false, error: e.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
