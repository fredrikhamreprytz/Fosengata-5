import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="rounded-2xl bg-white dark:bg-slate-800 p-10 shadow-md text-center space-y-6 border border-slate-100 dark:border-slate-700 w-full max-w-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Husstand-appen</h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm">Organiser handlelist, oppskrifter og trening</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm text-center"
          >
            Logg inn
          </Link>
          <Link
            href="/signup"
            className="w-full py-2 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition font-medium text-sm text-center"
          >
            Opprett ny husstand
          </Link>
        </div>
      </div>
    </main>
  );
}
