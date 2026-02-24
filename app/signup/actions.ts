"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string).trim().toLowerCase();

  const allowed = (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!allowed.includes(email)) {
    redirect(
      "/signup?error=" +
        encodeURIComponent("Denne e-postadressen har ikke tilgang.")
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/", "layout");
  redirect(
    "/signup?message=" +
      encodeURIComponent("Sjekk e-posten din for å bekrefte kontoen")
  );
}
