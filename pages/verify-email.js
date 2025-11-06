import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

export default function VerifyEmail() {
  const { t, i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  // hydration-safe: only call t(...) after mount to avoid SSR/client mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const tSafe = (key, fallback) => (isMounted ? t(key, { defaultValue: fallback }) : fallback);

  useEffect(() => {
    let mounted = true;

    const checkVerification = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (error) {
          // keep checking but stop showing spinner if fatal error
          console.error("Error fetching user:", error.message || error);
          setChecking(false);
          return;
        }

        // If user exists and email is confirmed, redirect to dashboard
        if (user && user.email_confirmed_at) {
          setVerified(true);
          setChecking(false);
          // small delay so user sees success message before redirect
          setTimeout(() => {
            if (mounted) router.push("/profile");
          }, 1500); // redirect after 1.5s
        } else {
          setVerified(false);
          setChecking(false);
        }
      } catch (err) {
        console.error("Verification check failed:", err);
        if (mounted) setChecking(false);
      }
    };

    checkVerification();

    // Poll every 4 seconds until verified (client-only)
    const interval = setInterval(() => {
      checkVerification();
    }, 4000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">{tSafe("verify.checking", "Checking verification status...")}</p>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-600 font-semibold text-lg">
          {tSafe("verify.verified_msg", "Email verified! Redirecting to your dashboard...")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 text-center">
      <div className="max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          {tSafe("verify.title", "Check your email 📩")}
        </h1>
        <p className="text-gray-600 mb-6">
          {tSafe(
            "verify.instructions",
            "We sent a confirmation link to your email. Please verify your account to access your dashboard."
          )}
        </p>
        <p className="text-sm text-gray-500">
          {tSafe("verify.auto_update", "This page will automatically update once your email is verified.")}
        </p>
      </div>
    </div>
  );
}