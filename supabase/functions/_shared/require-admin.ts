import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Gate for admin-only functions (verify_jwt = false). Allows a signed-in user
// with the "admin" role in user_roles, or a server-to-server call bearing the
// service role key (e.g. create-bulk-printify-products -> create-printify-placeholder).
export async function requireAdmin(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const deny = (status: number, error: string) =>
    new Response(JSON.stringify({ error }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return deny(401, 'No authorization header');
  if (authHeader === `Bearer ${serviceKey}`) return null;

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (error || !user) return deny(401, 'Invalid token');

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();
  if (!roleData) return deny(403, 'Admin access required');

  return null;
}
