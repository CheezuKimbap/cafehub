import Link from "next/link";

export default function VerifyRequiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5e6cc] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#3E2C1C]">
          Verify your email
        </h1>

        <p className="text-sm text-gray-600">
          Your account was created successfully, but you must verify your email
          before logging in.
        </p>

        <p className="text-sm text-gray-500">
          Please check your inbox (and spam folder) for the verification email.
        </p>

        <div className="pt-2 space-y-2">
          <Link
            href="/login"
            className="block w-full rounded-full bg-black text-white py-2 text-sm"
          >
            Back to Login
          </Link>

          <Link
            href="/register"
            className="block text-xs text-gray-500 hover:underline"
          >
            Use a different email
          </Link>
        </div>
      </div>
    </div>
  );
}
