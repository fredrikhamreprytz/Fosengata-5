import Image from "next/image";
import { signOut } from "./actions";

export default function Header() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image
          src="/fosengata_5_logo.jpeg"
          alt="Fosengata 5 logo"
          width={80}
          height={80}
          className="rounded-full object-contain w-12 h-12 sm:w-20 sm:h-20"
        />
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Fosengata 5</h1>
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
