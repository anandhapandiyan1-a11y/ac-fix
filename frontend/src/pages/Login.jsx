import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await login(form);
      navigate(res.user.role === "customer" ? "/discover" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const quickFill = (email) => setForm((f) => ({ ...f, email }));

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>👋 Welcome back</h1>
        <p className="sub">Login to your AC-Fix account</p>

        <form onSubmit={submit}>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && <div className="err-msg">{error}</div>}

          <button className="btn btn-primary" style={{ width: "100%", marginTop: 22 }} disabled={busy}>
            {busy ? "Logging in..." : "Login →"}
          </button>
        </form>

        <div className="demo-box">
          <b style={{ color: "var(--ink)" }}>Demo accounts (password: <code>demo1234</code>)</b>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <button className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start" }} onClick={() => quickFill("customer@demo.com")}>
              🏠 Customer — customer@demo.com
            </button>
            <button className="btn btn-ghost btn-sm" style={{ justifyContent: "flex-start" }} onClick={() => quickFill("mechanic@demo.com")}>
              🔧 Mechanic — mechanic@demo.com
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 22, fontSize: 14, color: "var(--muted)" }}>
          New here? <Link to="/register" style={{ color: "var(--primary-dark)", fontWeight: 700 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
