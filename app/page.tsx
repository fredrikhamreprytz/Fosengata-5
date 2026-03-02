import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="rounded-2xl bg-white p-10 shadow-md text-center space-y-6 border border-slate-100 w-full max-w-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">Husstand-appen</h1>
          <p className="text-slate-500 text-sm">Organiser handlelist, oppskrifter og trening</p>
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
            className="w-full py-2 px-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium text-sm text-center"
          >
            Opprett ny husstand
          </Link>
        </div>
      </div>
    </main>
  );
}
