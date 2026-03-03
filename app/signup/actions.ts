"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { processHouseholdOnboarding } from "@/lib/onboarding";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const displayName = (formData.get("display_name") as string).trim();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  if (data.session) {
    // Session immediately available — upsert profile and run onboarding (handles invite auto-join)
    await supabase
      .from("profiles")
      .upsert({ id: data.user!.id, display_name: displayName }, { onConflict: "id", ignoreDuplicates: true });
    await processHouseholdOnboarding();
  }

  // Email confirmation enabled — user must confirm before logging in
  redirect(
    "/signup?message=" +
      encodeURIComponent("Sjekk e-posten din for å bekrefte kontoen")
  );
}
