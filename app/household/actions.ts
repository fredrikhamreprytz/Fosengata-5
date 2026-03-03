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

  const { data: householdId, error } = await supabase.rpc("create_household_with_owner", { p_name: name });

  if (error || !householdId) {
    const msg =
      error?.code === "23505"
        ? "Dette husstandsnavnet er allerede i bruk."
        : "Kunne ikke opprette husstand. Prøv igjen.";
    redirect("/household/setup?error=" + encodeURIComponent(msg));
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

  const { data: invite } = await supabase
    .from("household_invites")
    .select("household_id")
    .eq("id", id)
    .single();
  if (!invite) return;

  const { data: ownerCheck } = await supabase
    .from("household_members")
    .select("role")
    .eq("household_id", invite.household_id)
    .eq("user_id", user.id)
    .single();
  if (ownerCheck?.role !== "owner") return;

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

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("id", id)
    .single();
  if (!member) return;

  const { data: ownerCheck } = await supabase
    .from("household_members")
    .select("role")
    .eq("household_id", member.household_id)
    .eq("user_id", user.id)
    .single();
  if (ownerCheck?.role !== "owner") return;

  await supabase.from("household_members").delete().eq("id", id);
  revalidatePath("/household/settings");
}

export async function updateDisplayName(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke autentisert." };

  const displayName = (formData.get("display_name") as string | null)?.trim();
  if (!displayName) return { error: "Navn er påkrevd." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (error) return { error: "Kunne ikke oppdatere navn. Prøv igjen." };

  revalidatePath("/household/settings");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function requestJoinHousehold(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ikke autentisert.", success: false };

  const name = (formData.get("household_name") as string | null)?.trim();
  if (!name) return { error: "Husstandsnavn er påkrevd.", success: false };

  const { data: household } = await supabase
    .from("households")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (!household) {
    return { error: "Ingen husstand funnet med dette navnet.", success: false };
  }

  const { error } = await supabase.from("join_requests").insert({
    household_id: household.id,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Du har allerede sendt en forespørsel til denne husstanden.", success: false };
    }
    return { error: "Kunne ikke sende forespørsel. Prøv igjen.", success: false };
  }

  revalidatePath("/household/setup");
  return { error: null, success: true };
}

export async function acceptJoinRequest(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const requestId = formData.get("request_id") as string | null;
  if (!requestId) return;

  await supabase.rpc("accept_join_request", { p_request_id: requestId });
  revalidatePath("/household/settings");
}

export async function rejectJoinRequest(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const requestId = formData.get("request_id") as string | null;
  if (!requestId) return;

  // RLS enforces owner-only delete
  await supabase.from("join_requests").delete().eq("id", requestId);
  revalidatePath("/household/settings");
}

export async function cancelJoinRequest(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const requestId = formData.get("request_id") as string | null;
  if (!requestId) return;

  // RLS enforces own-user delete
  await supabase.from("join_requests").delete().eq("id", requestId);
  revalidatePath("/household/setup");
}
