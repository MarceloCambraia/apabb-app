import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Valida o JWT com anon key para extrair o user_id
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseUser.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = userData.user.id;

    // Cliente admin com service_role para deletar dados e o próprio usuário
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Deleta dados relacionados ao usuário (ordem: filhos antes de profiles)
    const tables = [
      "card_payments",
      "pix_charges",
      "boleto_charges",
      "donations",
      "subscriptions",
      "volunteer_opportunity_registrations",
      "project_registrations",
      "volunteers",
      "associates",
      "user_roles",
    ];

    for (const table of tables) {
      const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);
      // Ignora erro se a tabela não tiver coluna user_id ou não existir
      if (error) {
        console.log(`Aviso ao deletar ${table}:`, error.message);
      }
    }

    // Deleta o perfil (user_id é a PK em profiles)
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // Deleta o usuário do auth (remove de auth.users)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("Erro ao deletar usuário do auth:", deleteAuthError.message);
      throw new Error(deleteAuthError.message);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Erro deletar-conta:", e?.message || e);
    return new Response(
      JSON.stringify({ success: false, error: e.message || "Erro ao excluir conta" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
