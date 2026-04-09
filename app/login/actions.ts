"use server";

import { createClient } from "@/lib/supabase/server";
import { processHouseholdOnboarding } from "@/lib/onboarding";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent("Ugyldig e-post eller passord"));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Upsert profile (no-op if already exists)
  const displayName =
    (user.user_metadata?.display_name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "Ukjent";

  await supabase
    .from("profiles")
    .upsert({ id: user.id, display_name: displayName }, { onConflict: "id", ignoreDuplicates: true });

  await processHouseholdOnboarding();
}

export { loginWithGoogle } from "@/app/auth/google-actions";
