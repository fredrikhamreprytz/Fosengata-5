import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserHouseholdId } from "@/lib/household";
import { createHousehold } from "../actions";

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

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="rounded-2xl bg-white p-10 shadow-md w-full max-w-sm space-y-6 border border-slate-100">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Opprett husstand</h1>
          <p className="text-sm text-slate-500">Gi husstanden din et navn for å komme i gang</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
        )}

        <form action={createHousehold} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Husstandsnavn
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="f.eks. Fosengata 5"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
    </main>
  );
}
