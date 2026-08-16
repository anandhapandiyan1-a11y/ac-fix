import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    bio: "", skills: "", years_experience: 1, base_fee: 100,
    lat: 0, lng: 0, location_name: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (role === "mechanic" && typeof navigator !== "undefined" && navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 })
          );
          form.lat = pos.coords.latitude;
          form.lng = pos.coords.longitude;
        } catch {
          form.lat = 13.0827;
          form.lng = 80.2707;
          form.location_name = "Chennai (default)";
        }
      }
      const res = await register({ ...form, role });
      navigate(res.user.role === "customer" ? "/discover" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <h1>Create your account</h1>
        <p className="sub">Join as customer or verified mechanic</p>

        <div className="role-select">
          <div className={`role-option ${role === "customer" ? "active" : ""}`} onClick={() => setRole("customer")}>
            <div className="ro-icon">🏠</div>
            <b>Customer</b>
            <span>Book AC services</span>
          </div>
          <div className={`role-option ${role === "mechanic" ? "active" : ""}`} onClick={() => setRole("mechanic")}>
            <div className="ro-icon">🔧</div>
            <b>Mechanic</b>
            <span>Get nearby jobs</span>
          </div>
        </div>

        <form onSubmit={submit}>
          <label className="label">Full Name</label>
          <input className="input" required value={form.name} onChange={set("name")} placeholder="Your name" />
          <label className="label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" />
          <label className="label">Phone</label>
          <input className="input" required value={form.phone} onChange={set("phone")} placeholder="98765 43210" />
          <label className="label">Password (min 6 chars)</label>
          <input className="input" type="password" required minLength={6} value={form.password} onChange={set("password")} placeholder="••••••••" />

          {role === "mechanic" && (
            <>
              <label className="label">Skills / Specialization</label>
              <input className="input" value={form.skills} onChange={set("skills")} placeholder="e.g. Installation, Repair, Gas Top-up" />
              <label className="label">Experience (years)</label>
              <input className="input" type="number" min={0} value={form.years_experience} onChange={set("years_experience")} />
              <label className="label">Visit Charge (₹)</label>
              <input className="input" type="number" min={0} value={form.base_fee} onChange={set("base_fee")} />
              <label className="label">Service Area</label>
              <input className="input" value={form.location_name} onChange={set("location_name")} placeholder="e.g. T. Nagar, Chennai" />
            </>
          )}

          {error && <div className="err-msg">{error}</div>}

          <button className="btn btn-primary" style={{ width: "100%", marginTop: 22 }} disabled={busy}>
            {busy ? "Creating account..." : `Register as ${role} →`}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--muted)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary-dark)", fontWeight: 700 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
