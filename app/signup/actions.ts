"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const mode = (formData.get("mode") as string | null) ?? "create";

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?mode=${mode}&error=` + encodeURIComponent(error.message));
  }

  redirect(
    `/signup?mode=${mode}&message=` +
      encodeURIComponent("Sjekk e-posten din for å bekrefte kontoen")
  );
}
