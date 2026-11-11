import { createSupabaseServerClient } from "./server";

export async function getPortfolioAdminClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error("Unable to validate portfolio admin session:", userError.message);
    return null;
  }
  if (!user) return null;

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_portfolio_admin");
  if (adminError) {
    console.error("Unable to verify portfolio admin access:", adminError.message);
    return null;
  }
  if (!isAdmin) return null;

  return supabase;
}
