import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    icon: "🛡️",
    color: "#dbeafe",
    title: "Verified Local Mechanics",
    desc: "Every technician is background-checked with authentic ratings, reviews and service portfolios — no more blind trust.",
  },
  {
    icon: "💰",
    color: "#fef3c7",
    title: "Transparent Pricing",
    desc: "Standardized service rates shown upfront. Service fee + base visit charge — no hidden costs, no surprise bills.",
  },
  {
    icon: "⚡",
    color: "#d1fae5",
    title: "Instant Dispatch",
    desc: "Your booking with live address is instantly pushed to the nearest mechanic with built-in map navigation.",
  },
  {
    icon: "📍",
    color: "#ede9fe",
    title: "Location-Based Discovery",
    desc: "Find nearby AC experts around your home in seconds using live geolocation and distance filtering.",
  },
  {
    icon: "🔄",
    color: "#ffe4e6",
    title: "Live Status Tracking",
    desc: "Follow your job in real time — Pending → Accepted → On the Way → Completed — right from your phone.",
  },
  {
    icon: "⭐",
    color: "#cffafe",
    title: "Real Reviews & Ratings",
    desc: "Rate your experience after every service and help your neighbourhood pick the best professional.",
  },
];

const FLOW = [
  { n: "1", t: "Onboard", d: "Login as Customer or Mechanic" },
  { n: "2", t: "Locate", d: "Live address detection" },
  { n: "3", t: "Book", d: "Pick mechanic & service" },
  { n: "4", t: "Dispatch", d: "Job + route to mechanic" },
  { n: "5", t: "Review", d: "Rate & feedback after service" },
];

const DEMO_ROWS = [
  { name: "Ravi Kumar", sub: "AC Installation · T. Nagar", color: "#0ea5e9", status: "ON_THE_WAY", label: "Arriving in 12 min", cls: "badge-ON_THE_WAY" },
  { name: "Selvam P", sub: "AC Repair · Kodambakkam", color: "#8b5cf6", status: "ACCEPTED", label: "Accepted", cls: "badge-ACCEPTED" },
  { name: "Murugan S", sub: "Deep Cleaning · Vadapalani", color: "#f59e0b", status: "COMPLETED", label: "Completed", cls: "badge-COMPLETED" },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <>
      <header className="landing-hero">
        <div className="container hero-grid">
          <div className="hero">
            <span className="hero-kicker">🎓 FALL INTO TECHVERSE · AC-FIX</span>
            <h1>
              Your AC breaks down.
              <br />
              <span>Find a trusted mechanic in seconds.</span>
            </h1>
            <p>
              AC-Fix bridges residential customers with verified local AC technicians through
              transparent pricing, real-time reviews and instant location-based dispatch.
            </p>
            <div className="hero-cta">
              {user ? (
                <Link to={user.role === "customer" ? "/discover" : "/dashboard"} className="btn btn-primary" style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", color: "#78350f" }}>
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary">Get Started Free</Link>
                  <Link to="/login" className="btn btn-outline" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}>
                    Login
                  </Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div><b>5+</b><span>Service categories</span></div>
              <div><b>8+</b><span>Verified mechanics</span></div>
              <div><b>100%</b><span>Transparent pricing</span></div>
            </div>
          </div>

          <div className="hero-card">
            <h3><span className="pulse" /> Live Dispatch Feed</h3>
            {DEMO_ROWS.map((r) => (
              <div key={r.name} className="hero-row">
                <div className="m-avatar" style={{ background: r.color }}>{r.name[0]}</div>
                <div>
                  <b>{r.name}</b>
                  <span>{r.sub}</span>
                </div>
                <span className={`badge ${r.cls}`}>{r.label}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#166534" }}>
              🚗 Booking auto-dispatched to nearest mechanic with route coordinates
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Why AC-Fix?</h2>
            <p>Trust, transparency and accountability — the three things missing from local appliance servicing.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div className="section-head">
            <h2>How It Works</h2>
            <p>A five-step journey from problem to solved.</p>
          </div>
          <div className="flow">
            {FLOW.map((s) => (
              <div key={s.n} className="flow-step">
                <div className="flow-num">{s.n}</div>
                <b>{s.t}</b>
                <span>{s.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 28 }}>🚀 Ready to fix your AC?</h2>
          <p style={{ color: "var(--muted)", marginTop: 10 }}>
            Join the dual-user ecosystem — customers and mechanics, connected directly.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 26 }}>
            <Link to="/register" className="btn btn-primary">Create Free Account</Link>
            <Link to="/login" className="btn btn-outline">Login</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <span><b style={{ color: "#fff" }}>AC-Fix</b> — Local AC Service & Mechanic Finder</span>
          <span>FALL INTO TECHVERSE · EduMentor AI · Team: T. Raja Kamala Kannan</span>
        </div>
      </footer>
    </>
  );
}
