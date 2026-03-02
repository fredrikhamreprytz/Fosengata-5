import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserHouseholdId } from "@/lib/household";
import { removeInvite, removeMember } from "../actions";
import InviteForm from "./InviteForm";

export default async function HouseholdSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const householdId = await getUserHouseholdId();
  if (!householdId) redirect("/household/setup");

  const [householdResult, membersResult, invitesResult] = await Promise.all([
    supabase.from("households").select("name").eq("id", householdId).single(),
    supabase.from("household_members").select("id, user_id, role").eq("household_id", householdId),
    supabase.from("household_invites").select("id, invited_email, created_at").eq("household_id", householdId).order("created_at", { ascending: true }),
  ]);

  const householdName = householdResult.data?.name ?? "";
  const members = membersResult.data ?? [];
  const invites = invitesResult.data ?? [];

  const currentMember = members.find((m) => m.user_id === user.id);
  const isOwner = currentMember?.role === "owner";

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-slate-50 py-12 px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 transition">
            ← Tilbake
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">{householdName}</h1>
          <p className="text-sm text-slate-500">Innstillinger for husstanden</p>
        </div>

        {/* Members */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-700">Medlemmer</h2>
          <ul className="divide-y divide-slate-100">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between py-3">
                <div>
                  <span className="text-sm text-slate-800">
                    {member.user_id === user.id ? "Deg" : member.user_id}
                  </span>
                  <span className="ml-2 text-xs text-slate-400">
                    {member.role === "owner" ? "(eier)" : ""}
                  </span>
                </div>
                {isOwner && member.user_id !== user.id && (
                  <form action={removeMember}>
                    <input type="hidden" name="id" value={member.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-500 hover:text-red-700 transition"
                    >
                      Fjern
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Invites */}
        {isOwner && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-700">Invitasjoner</h2>

            {invites.length > 0 ? (
              <ul className="divide-y divide-slate-100 mb-4">
                {invites.map((invite) => (
                  <li key={invite.id} className="flex items-center justify-between py-3">
                    <span className="text-sm text-slate-600">{invite.invited_email}</span>
                    <form action={removeInvite}>
                      <input type="hidden" name="id" value={invite.id} />
                      <button
                        type="submit"
                        className="text-xs text-red-500 hover:text-red-700 transition"
                      >
                        Fjern
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Ingen ventende invitasjoner.</p>
            )}

            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Inviter nytt medlem</h3>
              <InviteForm householdId={householdId} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
