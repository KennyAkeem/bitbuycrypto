import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleReset = async e => {
    e.preventDefault();
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated! You can now log in.");
      setTimeout(() => router.push("/"), 2000);
    }
  };

  return (
    <div className="container py-5">
      <h2>Reset Password</h2>
      <form onSubmit={handleReset} style={{ maxWidth: 400 }}>
        <label>New Password</label>
        <input
          type="password"
          value={password}
          minLength={6}
          onChange={e => setPassword(e.target.value)}
          className="form-control mb-3"
          required
        />
        <button type="submit" className="btn btn-success w-100">Set Password</button>
        {message && <div className="mt-3">{message}</div>}
      </form>
    </div>
  );
}