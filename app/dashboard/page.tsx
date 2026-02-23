import { signOut } from "./actions";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="rounded-2xl bg-white p-10 shadow-md text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">Fosengata 5</h1>
        <p className="text-gray-500">Dashbordet er under utvikling.</p>
        <form action={signOut}>
          <button
            type="submit"
            className="mt-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            Logg ut
          </button>
        </form>
      </div>
    </main>
  );
}
