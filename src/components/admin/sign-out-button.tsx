"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { showErrorAlert } from "@/lib/alerts";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  async function signOut() {
    setIsSigningOut(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Unable to sign out portfolio admin:", error);
      await showErrorAlert(
        "Could not sign out",
        error instanceof Error ? error.message : "Please try again."
      );
      setIsSigningOut(false);
    }
  }

  return (
    <Button type="button" variant="outline" disabled={isSigningOut} onClick={() => void signOut()}>
      <LogOut className="mr-2 h-4 w-4" />
      {isSigningOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}
