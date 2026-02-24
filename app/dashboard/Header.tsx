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
          className="rounded-full object-cover"
        />
        <h1 className="text-2xl font-bold text-gray-800">Fosengata 5</h1>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition font-medium"
        >
          Logg ut
        </button>
      </form>
    </div>
  );
}
