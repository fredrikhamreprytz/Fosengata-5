import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="rounded-2xl bg-white p-10 shadow-md w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Logg inn
        </h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-green-600 bg-green-50 rounded-lg px-4 py-2">
            {message}
          </p>
        )}

        <form action={login} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              E-post
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Passord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-medium text-sm"
          >
            Logg inn
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Har du ikke konto?{" "}
          <a href="/signup" className="font-medium text-gray-800 hover:underline">
            Registrer deg
          </a>
        </p>
      </div>
    </main>
  );
}
