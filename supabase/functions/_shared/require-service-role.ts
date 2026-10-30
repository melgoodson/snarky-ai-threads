// Gate for internal functions (verify_jwt = false) that only other edge
// functions should call. supabase.functions.invoke() from a service-role
// client sends the service role key as the bearer token.
export function requireServiceRole(
  req: Request,
  corsHeaders: Record<string, string>,
): Response | null {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (serviceKey && req.headers.get('Authorization') === `Bearer ${serviceKey}`) {
    return null;
  }
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
