"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createHousehold(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = (formData.get("name") as string | null)?.trim();
  if (!name) redirect("/household/setup?error=" + encodeURIComponent("Husstandsnavn er påkrevd."));

  const { data: household, error: householdError } = await supabase
    .from("households")
    .insert({ name })
    .select("id")
    .single();

  if (householdError || !household) {
    redirect("/household/setup?error=" + encodeURIComponent("Kunne ikke opprette husstand. Prøv igjen."));
  }

  const { error: memberError } = await supabase.from("household_members").insert({
    household_id: household.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    redirect("/household/setup?error=" + encodeURIComponent("Kunne ikke opprette husstand. Prøv igjen."));
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function inviteMember(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke autentisert." };

  const householdId = formData.get("household_id") as string | null;
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();

  if (!householdId || !email) return { error: "Mangler informasjon." };

  const { data: membership } = await supabase
    .from("household_members")
    .select("role")
    .eq("household_id", householdId)
    .eq("user_id", user.id)
    .single();

  if (membership?.role !== "owner") return { error: "Kun eier kan invitere medlemmer." };

  const { error } = await supabase.from("household_invites").insert({
    household_id: householdId,
    invited_email: email,
    invited_by: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Denne e-postadressen er allerede invitert." };
    }
    return { error: "Kunne ikke sende invitasjon. Prøv igjen." };
  }

  revalidatePath("/household/settings");
  return { error: null };
}

export async function removeInvite(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id") as string | null;
  if (!id) return;

  await supabase.from("household_invites").delete().eq("id", id);
  revalidatePath("/household/settings");
}

export async function removeMember(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id") as string | null;
  if (!id) return;

  await supabase.from("household_members").delete().eq("id", id);
  revalidatePath("/household/settings");
}
