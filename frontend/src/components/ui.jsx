import React from "react";

export function Stars({ rating, count }) {
  if (rating == null)
    return <span className="stars-empty">☆☆☆☆☆ <span style={{ color: "var(--muted)", fontSize: 12 }}>New</span></span>;
  const full = Math.round(rating);
  return (
    <span>
      <span className="stars">{"★".repeat(full)}{"☆".repeat(5 - full)}</span>{" "}
      <span style={{ fontSize: 13, color: "var(--muted)" }}>
        {rating} {count != null && `(${count})`}
      </span>
    </span>
  );
}

export function StatusBadge({ status }) {
  const labels = {
    PENDING: "⏳ Pending",
    ACCEPTED: "✅ Accepted",
    ON_THE_WAY: "🚗 On the Way",
    COMPLETED: "✔️ Completed",
    CANCELLED: "✕ Cancelled",
  };
  return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
}

const ORDER = ["PENDING", "ACCEPTED", "ON_THE_WAY", "COMPLETED"];

export function StatusTimeline({ status }) {
  if (status === "CANCELLED") return null;
  const idx = ORDER.indexOf(status);
  return (
    <div className="timeline">
      {ORDER.map((s, i) => (
        <div key={s} className={`step ${i < idx ? "done" : i === idx ? "current" : ""}`}>
          <div className="bar" />
          {s === "PENDING" ? "Requested" : s === "ACCEPTED" ? "Accepted" : s === "ON_THE_WAY" ? "On the way" : "Completed"}
        </div>
      ))}
    </div>
  );
}

export function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hues = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#6366f1"];
  const hue = hues[(name || "?").length % hues.length];
  return <div className="avatar" style={{ background: hue }}>{initials}</div>;
}
