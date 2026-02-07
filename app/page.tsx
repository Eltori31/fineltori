import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Fineltori</h1>
        <p className="text-lg text-gray-600">
          Your wealth management platform
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
