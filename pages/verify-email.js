import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function VerifyEmail() {
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkVerification = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        setChecking(false);
        return;
      }

      // If user exists and email is confirmed, redirect to dashboard
      if (user && user.email_confirmed_at) {
        setVerified(true);
        setTimeout(() => router.push("/profile"), 1500); // redirect after 1.5s
      } else {
        setVerified(false);
      }

      setChecking(false);
    };

    checkVerification();

    // Optional: check every few seconds until verified
    const interval = setInterval(checkVerification, 4000);
    return () => clearInterval(interval);
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Checking verification status...</p>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-600 font-semibold text-lg">
          Email verified! Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 text-center">
      <div className="max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Check your email 📩
        </h1>
        <p className="text-gray-600 mb-6">
          We sent a confirmation link to your email. Please verify your account to access your dashboard.
        </p>
        <p className="text-sm text-gray-500">
          This page will automatically update once your email is verified.
        </p>
      </div>
    </div>
  );
}
