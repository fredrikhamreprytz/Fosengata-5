"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  // Check if user already belongs to a household
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  // Check for a pending invite
  const { data: invite } = await supabase
    .from("household_invites")
    .select("id, household_id")
    .eq("invited_email", user.email ?? "")
    .maybeSingle();

  if (invite) {
    await supabase.from("household_members").insert({
      household_id: invite.household_id,
      user_id: user.id,
      role: "member",
    });
    await supabase.from("household_invites").delete().eq("id", invite.id);

    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  // No household and no invite — prompt user to create one
  revalidatePath("/", "layout");
  redirect("/household/setup");
}
