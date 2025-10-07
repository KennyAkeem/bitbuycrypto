import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";

function getErrorMessage(err, fallback) {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  return fallback;
}

export default function AuthModal({ initialView = "login", onClose, showToast }) {
  const [view, setView] = useState(initialView);
  const { register, login } = useUser();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setForm({ name: "", email: "", password: "" });
  }, [view]);

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onRegister(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      showToast && showToast("success", "Account created!");
      const loggedInUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (loggedInUser?.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
      onClose();
    } catch (err) {
      console.error("Register error", err);
      showToast && showToast("error", getErrorMessage(err, "Registration failed!"));
    } finally {
      setLoading(false);
    }
  }

  async function onLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      showToast && showToast("success", "Login successful!");
      const loggedInUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (loggedInUser?.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
      onClose();
    } catch (err) {
      console.error("Login error", err);
      showToast && showToast("error", getErrorMessage(err, "Login failed!"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="auth-modal-backdrop"
      role="dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}>
          &times;
        </button>

        {view === "login" ? (
          <div id="login-form">
            <h3 className="mb-3">Login</h3>
            <form onSubmit={onLogin}>
              <label>Email</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={onChange}
                disabled={loading}
              />
              <label>Password</label>
              <input
                name="password"
                type="password"
                required
                value={form.password}
                onChange={onChange}
                disabled={loading}
              />
              <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm"></span> : "Login"}
              </button>
            </form>
            <p className="text-muted small mt-3">
              No account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setView("register");
                }}
              >
                Register
              </a>
            </p>
          </div>
        ) : (
          <div id="register-form">
            <h3 className="mb-3">Create Account</h3>
            <form onSubmit={onRegister}>
              <label>Display Name</label>
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={onChange}
                disabled={loading}
              />
              <label>Email</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={onChange}
                disabled={loading}
              />
              <label>Password</label>
              <input
                name="password"
                type="password"
                required
                value={form.password}
                onChange={onChange}
                disabled={loading}
              />
              <button type="submit" className="btn btn-success w-100 mt-3" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm"></span> : "Register"}
              </button>
            </form>
            <p className="text-muted small mt-3">
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setView("login");
                }}
              >
                Login
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}