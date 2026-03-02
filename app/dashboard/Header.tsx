import Image from "next/image";
import Link from "next/link";
import { signOut } from "./actions";

export default function Header({ householdName }: { householdName: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image
          src="/fosengata_5_logo.jpeg"
          alt="Husstand logo"
          width={80}
          height={80}
          className="rounded-full object-contain w-12 h-12 sm:w-20 sm:h-20"
        />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{householdName}</h1>
          <Link
            href="/household/settings"
            className="text-xs text-slate-400 hover:text-slate-600 transition"
          >
            Innstillinger
          </Link>
        </div>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition font-medium"
        >
          Logg ut
        </button>
      </form>
    </div>
  );
}
