import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getPortfolioAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!getSupabaseConfig()) {
    return (
      <main className="min-h-screen bg-background px-4 pt-32">
        <section className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8">
          <h1 className="text-2xl font-bold text-foreground">Admin setup required</h1>
          <p className="mt-3 text-muted-foreground">
            Configure the Supabase project URL and publishable key, then run the portfolio SQL setup.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await getPortfolioAdminClient();
  if (!supabase) redirect("/login");

  return (
    <main className="min-h-screen bg-background pt-28">
      <div className="mx-auto mb-8 flex max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">← Back to portfolio</Link>
        <SignOutButton />
      </div>
      <AdminDashboard />
    </main>
  );
}
