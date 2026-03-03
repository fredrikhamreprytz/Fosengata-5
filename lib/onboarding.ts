import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function processHouseholdOnboarding(): Promise<never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (membership) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  const { data: invite } = await supabase
    .from("household_invites")
    .select("id, household_id")
    .eq("invited_email", user.email ?? "")
    .maybeSingle();
  if (invite) {
    await supabase
      .from("household_members")
      .insert({ household_id: invite.household_id, user_id: user.id, role: "member" });
    await supabase.from("household_invites").delete().eq("id", invite.id);
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  revalidatePath("/", "layout");
  redirect("/household/setup");
}
