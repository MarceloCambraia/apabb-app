import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminUser {
  nucleus: string;
  nucleusName: string;
  email: string;
  password: string;
}

const adminUsers: AdminUser[] = [
  { nucleus: 'df', nucleusName: 'Brasília - DF', email: 'admin.df@apabb.org.br', password: 'Apabb@DF2025!' },
  { nucleus: 'sp', nucleusName: 'São Paulo - SP', email: 'admin.sp@apabb.org.br', password: 'Apabb@SP2025!' },
  { nucleus: 'rj', nucleusName: 'Rio de Janeiro - RJ', email: 'admin.rj@apabb.org.br', password: 'Apabb@RJ2025!' },
  { nucleus: 'mg', nucleusName: 'Belo Horizonte - MG', email: 'admin.mg@apabb.org.br', password: 'Apabb@MG2025!' },
  { nucleus: 'rs', nucleusName: 'Porto Alegre - RS', email: 'admin.rs@apabb.org.br', password: 'Apabb@RS2025!' },
  { nucleus: 'ba', nucleusName: 'Salvador - BA', email: 'admin.ba@apabb.org.br', password: 'Apabb@BA2025!' },
  { nucleus: 'pr', nucleusName: 'Curitiba - PR', email: 'admin.pr@apabb.org.br', password: 'Apabb@PR2025!' },
  { nucleus: 'ce', nucleusName: 'Fortaleza - CE', email: 'admin.ce@apabb.org.br', password: 'Apabb@CE2025!' },
  { nucleus: 'pe', nucleusName: 'Recife - PE', email: 'admin.pe@apabb.org.br', password: 'Apabb@PE2025!' },
  { nucleus: 'go', nucleusName: 'Goiânia - GO', email: 'admin.go@apabb.org.br', password: 'Apabb@GO2025!' },
  { nucleus: 'pa', nucleusName: 'Belém - PA', email: 'admin.pa@apabb.org.br', password: 'Apabb@PA2025!' },
  { nucleus: 'sc', nucleusName: 'Florianópolis - SC', email: 'admin.sc@apabb.org.br', password: 'Apabb@SC2025!' },
  { nucleus: 'es', nucleusName: 'Vitória - ES', email: 'admin.es@apabb.org.br', password: 'Apabb@ES2025!' },
  { nucleus: 'rn', nucleusName: 'Natal - RN', email: 'admin.rn@apabb.org.br', password: 'Apabb@RN2025!' },
  { nucleus: 'se', nucleusName: 'Aracaju - SE', email: 'admin.se@apabb.org.br', password: 'Apabb@SE2025!' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Simple validation - you can add a secret key check here for security
    const { secret } = await req.json().catch(() => ({}));
    
    if (secret !== 'APABB_ADMIN_SETUP_2025') {
      return new Response(
        JSON.stringify({ error: 'Invalid secret key' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const results = [];
    
    for (const admin of adminUsers) {
      try {
        // Create user
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: admin.email,
          password: admin.password,
          email_confirm: true,
          user_metadata: {
            full_name: `Admin ${admin.nucleusName}`,
            phone: ''
          }
        });

        if (userError) {
          results.push({
            nucleus: admin.nucleus,
            email: admin.email,
            status: 'error',
            error: userError.message
          });
          continue;
        }

        // Assign admin role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userData.user.id,
            role: 'admin',
            nucleus: admin.nucleus
          });

        if (roleError) {
          results.push({
            nucleus: admin.nucleus,
            email: admin.email,
            status: 'partial',
            message: 'User created but role assignment failed',
            error: roleError.message
          });
        } else {
          results.push({
            nucleus: admin.nucleus,
            nucleusName: admin.nucleusName,
            email: admin.email,
            password: admin.password,
            status: 'success'
          });
        }
      } catch (error) {
        results.push({
          nucleus: admin.nucleus,
          email: admin.email,
          status: 'error',
          error: (error as Error).message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Admin users creation process completed',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
