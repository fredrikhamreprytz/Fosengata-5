import Image from "next/image";
import Link from "next/link";
import { signOut } from "./actions";
import ThemeToggle from "./ThemeToggle";

export default function Header({ householdName, userName }: { householdName: string; userName: string }) {
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{householdName}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Hei, {userName}</p>
          <Link
            href="/household/settings"
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            Innstillinger
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <form action={signOut}>
          <button
            type="submit"
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
          >
            Logg ut
          </button>
        </form>
      </div>
    </div>
  );
}
