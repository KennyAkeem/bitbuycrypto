import React, { useState, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";

/* Helper for error messages */
function getErrorMessage(err, fallback) {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  return fallback;
}

/* Clear chat history */
function resetDialogflowMessengerChat() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("df-messenger-chat-history");
    window.sessionStorage.removeItem("df-messenger-chat-history");
  }
}

/* Helper to always get latest profile from session (flattened) */
async function fetchCurrentProfile() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return profile;
}

/* Helper to get IP/location (for richer logging) */
async function getClientInfo() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return {};
    const info = await res.json();
    return {
      ip: info.ip || null,
      city: info.city || null,
      region: info.region || null,
      country: info.country_name || null,
    };
  } catch (err) {
    console.error("Failed to get client info:", err);
    return {};
  }
}

/* Safe log helper */
async function safeLogActivity(userId, event, description = "") {
  try {
    const mod = await import("../utils/logUserActivity");
    if (mod && typeof mod.logUserActivity === "function") {
      const clientInfo = await getClientInfo();
      mod
        .logUserActivity(userId, event, description, clientInfo)
        .catch((err) => console.error("logUserActivity rejected:", err));
    } else {
      console.warn("logUserActivity not found in ../utils/logUserActivity");
    }
  } catch (err) {
    console.error("Failed to import or run logUserActivity:", err);
  }
}

export default function AuthModal({ initialView = "login", onClose, showToast }) {
  const { t, i18n } = useTranslation();
  // track mount to avoid server/client hydration mismatch when using translations
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // --- same state/logic as before ---
  const [view, setView] = useState(initialView);
  const { register, login } = useUser();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // UX states
  const [showPassword, setShowPassword] = useState(false);

  // Inline error states
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", password: "", confirm: "" });

  useEffect(() => {
    // reset form and errors on view change
    setForm({ name: "", email: "", password: "", confirm: "" });
    setShowForgot(false);
    setForgotMessage("");
    setForgotEmail("");
    setShowPassword(false);
    setGeneralError("");
    setFieldErrors({ name: "", email: "", password: "", confirm: "" });
  }, [view]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the specific field error and general error on change
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneralError("");
  }

  const MIN_LEN = 6; // at least 6 characters
  const emailRe = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
  const hasUpper = (pw) => /[A-Z]/.test(pw);
  const hasLower = (pw) => /[a-z]/.test(pw);
  const hasDigit = (pw) => /\d/.test(pw);
  const meetsLen = (pw) => pw.length >= MIN_LEN;

  const emailValid = useMemo(() => emailRe.test(form.email.trim()), [form.email, emailRe]);
  const pwUpper = hasUpper(form.password);
  const pwLower = hasLower(form.password);
  const pwDigit = hasDigit(form.password);
  const pwLen = meetsLen(form.password);
  const pwValid = pwUpper && pwLower && pwDigit && pwLen;
  const confirmValid = form.password === form.confirm && form.confirm.length > 0;

  const charsLeft = Math.max(0, MIN_LEN - form.password.length);

  async function onRegister(e) {
    e.preventDefault();
    setLoading(true);
    setGeneralError("");
    setFieldErrors({ name: "", email: "", password: "", confirm: "" });

    // client-side guard before sending to server
    const newFieldErrors = { name: "", email: "", password: "", confirm: "" };
    let hasError = false;

    if (!form.name.trim()) {
      newFieldErrors.name = isMounted ? t("auth.display_name_required") || "Display name is required." : "Display name is required.";
      hasError = true;
    }
    if (!emailValid) {
      newFieldErrors.email = isMounted ? t("auth.invalid_email") || "Please enter a valid email address." : "Please enter a valid email address.";
      hasError = true;
    }
    if (!pwValid) {
      newFieldErrors.password = isMounted ? t("auth.password_requirements") || "Password must be at least 6 chars, include upper & lower case letters and a number." : "Password must be at least 6 chars, include upper & lower case letters and a number.";
      hasError = true;
    }
    if (!confirmValid) {
      newFieldErrors.confirm = isMounted ? t("auth.passwords_mismatch") || "Passwords do not match." : "Passwords do not match.";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    try {
      // call register from UserContext (this signs the user up via Supabase)
      await register({
        name: form.name,
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      resetDialogflowMessengerChat();
      showToast && showToast("success", isMounted ? t("auth.account_created") || "Account created!" : "Account created!");

      // small delay to allow Supabase to finalize session if it will create one
      await new Promise((r) => setTimeout(r, 900));

      // Check Supabase session: if email confirmation is required, session will be null
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // No session: user must verify email. Redirect to /verify-email and close modal.
        router.push("/verify-email");
        onClose();
        return;
      }

      // If session exists, proceed to fetch profile and continue as before
      const profile = await fetchCurrentProfile();
      const logUserId = profile?.id || session?.user?.id || null;

      if (logUserId) {
        safeLogActivity(logUserId, "signup", "New user registered");
      }

      if (profile?.is_admin) router.push("/admin");
      else router.push("/profile");

      onClose();
    } catch (err) {
      console.error("Register error", err);
      // show inline error instead of toast for failures
      setGeneralError(getErrorMessage(err, isMounted ? t("auth.registration_failed") || "Registration failed!" : "Registration failed!"));
    } finally {
      setLoading(false);
    }
  }

  async function onLogin(e) {
    e.preventDefault();
    setLoading(true);
    setGeneralError("");
    setFieldErrors({ name: "", email: "", password: "", confirm: "" });

    if (!emailValid) {
      setFieldErrors((prev) => ({ ...prev, email: isMounted ? t("auth.invalid_email") || "Please enter a valid email address." : "Please enter a valid email address." }));
      setLoading(false);
      return;
    }
    if (!form.password || form.password.length === 0) {
      setFieldErrors((prev) => ({ ...prev, password: isMounted ? t("auth.enter_password") || "Enter your password." : "Enter your password." }));
      setLoading(false);
      return;
    }

    try {
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      resetDialogflowMessengerChat();
      showToast && showToast("success", isMounted ? t("auth.login_successful") || "Login successful!" : "Login successful!");

      await new Promise((r) => setTimeout(r, 1000));

      const profile = await fetchCurrentProfile();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const logUserId = profile?.id || session?.user?.id || null;

      if (logUserId) {
        safeLogActivity(logUserId, "login", "User logged in");
      }

      if (profile?.is_admin) router.push("/admin");
      else router.push("/profile");

      onClose();
    } catch (err) {
      console.error("Login error", err);
      // inline error shown on the form
      setGeneralError(getErrorMessage(err, isMounted ? t("auth.login_failed") || "Login failed! Check your credentials." : "Login failed! Check your credentials."));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setForgotMessage("");
    setForgotLoading(true);

    const emailToUse = forgotEmail.trim().toLowerCase();
    if (!emailToUse || !emailRe.test(emailToUse)) {
      setForgotMessage(isMounted ? t("auth.enter_valid_email") || "Enter a valid email." : "Enter a valid email.");
      setForgotLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailToUse, {
      redirectTo:
        typeof window !== "undefined"
          ? window.location.origin + "/reset-password"
          : undefined,
    });
    if (error) setForgotMessage(error.message || (isMounted ? t("auth.reset_failed") || "Failed to send reset link." : "Failed to send reset link."));
    else setForgotMessage(isMounted ? t("auth.reset_sent") || "Reset link sent! Check your email." : "Reset link sent! Check your email.");
    setForgotLoading(false);
  }

  // --- PORTAL / TOPMOST behavior ---
  const [mounted, setMounted] = useState(false);
  const portalElRef = useRef(null);

  useEffect(() => {
    // Only run in the browser
    setMounted(true);
    const portalEl = document.createElement("div");
    // use an id/class so you can override if needed
    portalEl.setAttribute("id", "auth-modal-portal");
    // ensure portal sits above everything; extremely high z-index and isolate pointer events
    portalEl.style.position = "fixed";
    portalEl.style.inset = "0";
    portalEl.style.zIndex = "2147483647"; // max 32-bit signed int - effectively topmost
    portalEl.style.pointerEvents = "none"; // allow the modal/backdrop to control pointer-events inside
    document.body.appendChild(portalEl);
    portalElRef.current = portalEl;

    return () => {
      if (portalElRef.current && portalElRef.current.parentNode) {
        portalElRef.current.parentNode.removeChild(portalElRef.current);
      }
    };
  }, []);

  if (!mounted || !portalElRef.current) return null;

  // helper to safely get translated strings with English fallback on server
  const tSafe = (key, fallback) => (isMounted ? (t(key) || fallback) : fallback);

  // The modal content. pointer-events set to auto inside so clicks work.
  const modalContent = (
    <div
      style={{ pointerEvents: "auto" }}
      aria-modal="true"
      aria-hidden="false"
    >
      <div
        className="auth-backdrop"
        role="dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="auth-modal" role="document" aria-labelledby="auth-title">
          <button
            className="auth-close"
            onClick={onClose}
            aria-label={tSafe("auth.close", "Close authentication dialog")}
          >
            ×
          </button>

          <div className="auth-header">
            <div className="auth-logo" aria-hidden>
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M7 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 id="auth-title" className="auth-title">
                {view === "register" ? tSafe("auth.create_account", "Create Account") : tSafe("auth.welcome_back", "Welcome back")}
              </h3>
              <p className="auth-subtitle">
                {view === "register" ? tSafe("auth.join_us", "Join us — secure and fast.") : tSafe("auth.sign_in_to_continue", "Sign in to continue.")}
              </p>
            </div>
          </div>

          {view === "login" && !showForgot ? (
            <div id="login-form" className="auth-form-wrap">
              <form onSubmit={onLogin} noValidate>
                <label className="auth-label">{tSafe("auth.email", "Email")}</label>
                <input
                  name="email"
                  type="email"
                  className="auth-input"
                  required
                  value={form.email}
                  onChange={onChange}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && (
                  <div className="auth-field-error" role="alert" aria-live="polite">
                    {fieldErrors.email}
                  </div>
                )}

                <label className="auth-label mt">{tSafe("auth.password", "Password")}</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  required
                  value={form.password}
                  onChange={onChange}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.password}
                />
                {fieldErrors.password && (
                  <div className="auth-field-error" role="alert" aria-live="polite">
                    {fieldErrors.password}
                  </div>
                )}

                <label className="auth-smallLabel auth-checkbox">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />{" "}
                  {tSafe("auth.show_password", "Show password")}
                </label>

                {/* general form-level error */}
                {generalError && (
                  <div className="auth-field-error" role="alert" aria-live="polite" style={{ marginTop: 8 }}>
                    {generalError}
                  </div>
                )}

                <button
                  type="submit"
                  className="auth-primaryBtn"
                  disabled={loading || !emailValid || form.password.length === 0}
                >
                  {loading ? <span className="auth-spinner" /> : tSafe("auth.login", "Login")}
                </button>
              </form>

              <div className="auth-links">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgot(true);
                  }}
                >
                  {tSafe("auth.forgot_password", "Forgot password?")}
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setView("register");
                  }}
                >
                  {tSafe("auth.register", "Register")}
                </a>
              </div>
            </div>
          ) : view === "login" && showForgot ? (
            <div id="forgot-form" className="auth-form-wrap">
              <form onSubmit={handleForgot} noValidate>
                <label className="auth-label">{tSafe("auth.email", "Email")}</label>
                <input
                  type="email"
                  className="auth-input"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  disabled={forgotLoading}
                  aria-invalid={forgotEmail.length > 0 && !emailRe.test(forgotEmail)}
                />
                <button type="submit" className="auth-primaryBtn" disabled={forgotLoading}>
                  {forgotLoading ? <span className="auth-spinner" /> : tSafe("auth.send_reset_link", "Send Reset Link")}
                </button>
              </form>
              <button
                className="auth-linkBtn"
                onClick={() => {
                  setShowForgot(false);
                  setForgotMessage("");
                }}
              >
                {tSafe("auth.back_to_login", "Back to Login")}
              </button>
              {forgotMessage && <div className="auth-message" role="status">{forgotMessage}</div>}
            </div>
          ) : (
            <div id="register-form" className="auth-form-wrap">
              <form onSubmit={onRegister} noValidate>
                <label className="auth-label">{tSafe("auth.display_name", "Display Name")}</label>
                <input
                  name="name"
                  type="text"
                  className="auth-input"
                  required
                  value={form.name}
                  onChange={onChange}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && (
                  <div className="auth-field-error" role="alert" aria-live="polite">
                    {fieldErrors.name}
                  </div>
                )}

                <label className="auth-label mt">{tSafe("auth.email", "Email")}</label>
                <input
                  name="email"
                  type="email"
                  className="auth-input"
                  required
                  value={form.email}
                  onChange={onChange}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && (
                  <div className="auth-field-error" role="alert" aria-live="polite">
                    {fieldErrors.email}
                  </div>
                )}

                <label className="auth-label mt">{tSafe("auth.password", "Password")}</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  required
                  value={form.password}
                  onChange={onChange}
                  disabled={loading}
                  aria-describedby="pw-requirements"
                  aria-invalid={!!fieldErrors.password}
                />
                {fieldErrors.password && (
                  <div className="auth-field-error" role="alert" aria-live="polite">
                    {fieldErrors.password}
                  </div>
                )}

                <label className="auth-smallLabel auth-checkbox">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />{" "}
                  {tSafe("auth.show_password", "Show password")}
                </label>

                <div id="pw-requirements" className="auth-pw-checklist">
                  <div className={pwLen ? "auth-ok" : "auth-fail"}>
                    {pwLen ? "✓" : "✗"} {tSafe("auth.min_chars", `At least ${MIN_LEN} characters`)}
                  </div>
                  <div className={pwUpper ? "auth-ok" : "auth-fail"}>
                    {pwUpper ? "✓" : "✗"} {tSafe("auth.uppercase", "At least one uppercase letter")}
                  </div>
                  <div className={pwLower ? "auth-ok" : "auth-fail"}>
                    {pwLower ? "✓" : "✗"} {tSafe("auth.lowercase", "At least one lowercase letter")}
                  </div>
                  <div className={pwDigit ? "auth-ok" : "auth-fail"}>
                    {pwDigit ? "✓" : "✗"} {tSafe("auth.number", "At least one number")}
                  </div>
                  <div className="auth-chars-left">
                    {tSafe("auth.chars_left", "Characters left")}: <strong>{charsLeft}</strong>
                  </div>
                </div>

                <label className="auth-label mt">{tSafe("auth.confirm_password", "Confirm password")}</label>
                <input
                  name="confirm"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  required
                  value={form.confirm}
                  onChange={onChange}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.confirm}
                />
                {fieldErrors.confirm && (
                  <div className="auth-field-error" role="alert" aria-live="polite">
                    {fieldErrors.confirm}
                  </div>
                )}

                {/* general form-level error */}
                {generalError && (
                  <div className="auth-field-error" role="alert" aria-live="polite" style={{ marginTop: 8 }}>
                    {generalError}
                  </div>
                )}

                <button
                  type="submit"
                  className="auth-successBtn"
                  disabled={loading || !emailValid || !pwValid || !confirmValid}
                >
                  {loading ? <span className="auth-spinner" /> : tSafe("auth.register", "Register")}
                </button>
              </form>

              <div className="auth-links">
                <span className="text-muted small">{tSafe("auth.already_have_account", "Already have an account?")}</span>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setView("login");
                  }}
                >
                  {tSafe("auth.login", "Login")}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

     <style jsx>{`
  


:root {
  --modal-max-width-desktop: min(50vw, 760px); /* never exceed 50% of page width, but cap at 760px */
  --modal-max-width-tablet: min(65vw, 720px);
  --modal-min-width: 360px;
  --modal-padding: 26px;
  --modal-radius: 14px;
  --bg: linear-gradient(180deg,#071021 0%, #0b1630 100%);
  --muted: rgba(255,255,255,0.7);
  --accent: #6ef2f1;
  --btn-alt-bg: rgba(255,255,255,0.03);
  --btn-alt-border: rgba(110,242,241,0.12);
  --btn-alt-color: #e9fbff;
  --btn-alt-hover: rgba(110,242,241,0.08);
}

/* Backdrop should stay absolutely topmost (portal z-index recommended) */
.auth-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(3,6,12,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 2147483647; /* keep extremely high so modal stays above everything */
  -webkit-overflow-scrolling: touch;
  pointer-events: auto; /* allow clicks through backdrop children */
}

/* Modal container (desktop centered, constrained width) */
.auth-modal {
  background: var(--bg);
  color: #e9fbff;
  width: 50%;
  max-width: var(--modal-max-width-desktop); /* desktop rule (50% max) */
  min-width: var(--modal-min-width);
  border-radius: var(--modal-radius);
  box-shadow: 0 20px 60px rgba(2,6,20,0.65);
  position: relative;
  padding: 12px 16px 24px 16px;
  outline: none;
  max-height: calc(100vh - 80px);
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 auto;
  z-index: 2147483648; /* ensure modal sits above the backdrop child */
  transform-origin: center center;
  scroll-width: thin;
}

/* ensure the modal is visually centered on wide screens */
@media (min-width: 1200px) {
  .auth-backdrop { align-items: center; justify-content: center; }
  .auth-modal { max-width: var(--modal-max-width-desktop); }
}

/* Tablet: allow a bit more width (comfortable reading), but still not full screen */
@media (max-width: 1024px) and (min-width: 481px) {
  :root {
    --modal-padding: 22px;
  }
  .auth-modal {
    max-width: var(--modal-max-width-tablet);
    min-width: 320px;
  }
}

/* Mobile: keep the bottom-sheet / full-screen behavior (unchanged) */
@media (max-width: 480px) {
  :root {
    --modal-radius: 0px;
    --modal-padding: 18px;
  }
  .auth-backdrop {
    align-items: flex-end;
    padding: 0;
  }
  .auth-modal {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
    padding: 16px;
    box-shadow: none;
    overflow: auto;
  }
  .auth-close {
    top: 10px;
    right: 10px;
    font-size: 20px;
  }
}

/* Buttons: keep primary styles but ensure alt links appear as pill buttons on desktop/tablet */
.auth-primaryBtn,
.auth-successBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
  width: 100%;
  padding: 12px 16px;
  font-weight: 700;
  font-size: 1rem;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: linear-gradient(90deg, rgba(107,96,255,0.95), rgba(110,242,241,0.95));
  box-shadow: 0 12px 30px rgba(107,96,255,0.14);
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 120ms ease;
}

/* Disabled appearance */
.auth-primaryBtn[disabled],
.auth-successBtn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Link area layout preserved; we'll style its <a> children as pill buttons on desktop/tablet */
.auth-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  font-size: 0.95rem;
}

/* Default anchor appearance inside links (keeps accessibility) */
.auth-links a {
  text-decoration: none;
  color: #bfeff0;
  font-weight: 600;
}

/* --- Styled action buttons (Login on Register form, Register on Login form) --- */
/* Make them look like pill buttons without changing markup. Target by parent form id. */

/* On the register page, style the Login link as a subtle outline button */
#register-form .auth-links a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--btn-alt-border);
  color: var(--btn-alt-color);
  font-weight: 700;
  transition: background-color 160ms ease, transform 120ms ease, box-shadow 160ms ease;
}
#register-form .auth-links a:hover,
#register-form .auth-links a:focus {
  background: linear-gradient(90deg, rgba(110,242,241,0.06), rgba(107,96,255,0.04));
  box-shadow: 0 10px 30px rgba(110,242,241,0.06);
  transform: translateY(-2px);
  outline: none;
}

/* On the login page, style the Register link as an accent-outline button */
#login-form .auth-links a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.06);
  color: #fff;
  font-weight: 700;
  transition: background-color 160ms ease, transform 120ms ease, box-shadow 160ms ease;
}
#login-form .auth-links a:hover,
#login-form .auth-links a:focus {
  background: rgba(255,255,255,0.04);
  box-shadow: 0 10px 30px rgba(255,255,255,0.04);
  transform: translateY(-2px);
  outline: none;
}

/* If there's text+link layout, make sure the link's visual button doesn't break layout */
.auth-links span.text-muted {
  opacity: 0.9;
  font-weight: 500;
}

/* ensure clickable region is large on desktop/tablet */
@media (min-width: 481px) {
  #register-form .auth-links a,
  #login-form .auth-links a {
    padding: 10px 14px;
  }
}

/* Keep small devices compact (links become simple inline links) */
@media (max-width: 480px) {
  #register-form .auth-links a,
  #login-form .auth-links a {
    display: inline-block;
    padding: 6px 8px;
    border-radius: 8px;
    font-weight: 600;
  }
  .auth-links {
    gap: 8px;
    justify-content: space-between;
  }
}

/* Minor polish: close button should never overlap important controls and remains tappable */
.auth-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: 0;
  color: var(--muted);
  font-size: 22px;
  line-height: 1;
  padding: 6px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 160ms ease, color 160ms ease, transform 120ms ease;
  z-index: 2147483650;
}
.auth-close:hover {
  background: rgba(255,255,255,0.04);
  color: #fff;
  transform: translateY(-1px);
}

/* Keep input and button sizing comfortable for tablet/desktop */
.auth-input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.04);
  background: rgba(255,255,255,0.03);
  color: #eafcff;
  font-size: 0.98rem;
}
.auth-input:focus {
  outline: none;
  box-shadow: 0 6px 20px rgba(110,242,241,0.06);
  border-color: rgba(110,242,241,0.28);
}

/* password checklist grid tweaks for larger screens */
.auth-pw-checklist {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 8px 12px;
  margin-top: 10px;
  font-size: 0.9rem;
  color: var(--muted);
}

/* Accessibility: respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .auth-modal,
  .auth-close,
  .auth-primaryBtn,
  .auth-successBtn,
  #register-form .auth-links a,
  #login-form .auth-links a {
    transition: none !important;
  }
}
`}</style>

    </div>
  );

  // Render portal content into the top-level portal element we created
  return ReactDOM.createPortal(modalContent, portalElRef.current);
}