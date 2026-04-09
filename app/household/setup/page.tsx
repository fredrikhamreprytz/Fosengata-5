import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserHouseholdId } from "@/lib/household";
import { createHousehold, cancelJoinRequest } from "../actions";
import JoinRequestForm from "./JoinRequestForm";

export default async function HouseholdSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const householdId = await getUserHouseholdId();
  if (householdId) redirect("/dashboard");

  // Check for a pending join request from this user
  const { data: pendingRequest } = await supabase
    .from("join_requests")
    .select("id, household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let pendingHouseholdName: string | null = null;
  if (pendingRequest) {
    const { data: household } = await supabase
      .from("households")
      .select("name")
      .eq("id", pendingRequest.household_id)
      .single();
    pendingHouseholdName = household?.name ?? null;
  }

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-sm space-y-4">
        {pendingRequest ? (
          <div className="rounded-2xl bg-white dark:bg-slate-800 p-10 shadow-md space-y-4 border border-slate-100 dark:border-slate-700">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Venter på svar</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Du har sendt en forespørsel om å bli med i{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">{pendingHouseholdName}</span>
              </p>
            </div>
            <form action={cancelJoinRequest}>
              <input type="hidden" name="request_id" value={pendingRequest.id} />
              <button
                type="submit"
                className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition font-medium text-sm"
              >
                Trekk tilbake forespørsel
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-white dark:bg-slate-800 p-10 shadow-md space-y-4 border border-slate-100 dark:border-slate-700">
              <div className="space-y-1 text-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Opprett husstand</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Gi husstanden din et navn for å komme i gang</p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2">{error}</p>
              )}

              <form action={createHousehold} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Husstandsnavn
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="f.eks. Fosengata 5"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm"
                >
                  Opprett husstand
                </button>
              </form>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-800 p-10 shadow-md space-y-4 border border-slate-100 dark:border-slate-700">
              <div className="space-y-1 text-center">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Be om tilgang</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Skriv inn husstandsnavnet du vil bli med i</p>
              </div>
              <JoinRequestForm />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
