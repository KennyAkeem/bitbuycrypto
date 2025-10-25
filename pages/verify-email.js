import Link from "next/link";

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 text-center">
      <div className="max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Check your email 📩
        </h1>
        <p className="text-gray-600 mb-6">
          We’ve sent a confirmation link to your email.  
          Please verify your account before accessing your dashboard.
        </p>
        <Link
          href="/login"
          className="text-indigo-600 hover:text-indigo-800 font-semibold"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
