import React, { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { Avatar, StatusBadge, StatusTimeline } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function MechanicDashboard() {
  const { user, mechanicProfile } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState(null);
  const [stats, setStats] = useState(null);
  const [notif, setNotif] = useState(null);
  const prevIds = useRef(new Set());

  const load = async () => {
    try {
      const [b, s] = await Promise.all([api.myBookings(), api.myStats()]);
      const newIds = new Set(b.map((x) => x.id));
      b.forEach((bk) => {
        if (bk.status === "PENDING" && !prevIds.current.has(bk.id)) {
          setNotif(bk);
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification("🔧 New job request!", { body: `${bk.service_name} · ${bk.address}` });
          }
          setTimeout(() => setNotif(null), 8000);
        }
      });
      prevIds.current = newIds;
      setBookings(b);
      setStats(s);
    } catch (e) {
      toast("Failed to load dashboard", "error");
    }
  };

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = async (b, status) => {
    try {
      const res = await api.updateStatus(b.id, status);
      toast(`Booking #${b.id} → ${status.replace("_", " ")}`, "success");
      if (status === "COMPLETED") {
        setTimeout(() => toast("Remind customer to rate the service ⭐", "info"), 500);
      }
      load();
      return res;
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const pending = (bookings || []).filter((b) => b.status === "PENDING");
  const active = (bookings || []).filter((b) => ["ACCEPTED", "ON_THE_WAY"].includes(b.status));
  const done = (bookings || []).filter((b) => ["COMPLETED", "CANCELLED"].includes(b.status));

  return (
    <div className="container">
      <div className="page-title">
        <h1>Mechanic Dashboard 🔧</h1>
        <p>Nearby job requests are auto-dispatched here with route coordinates.</p>
      </div>

      {notif && (
        <div className="notif-banner">
          <span style={{ fontSize: 20 }}>🔔</span>
          <div>
            New booking from <b>{notif.customer_name}</b> — {notif.service_name} at {notif.address}. Accept it below!
          </div>
        </div>
      )}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#dbeafe" }}>📋</div>
            <div><b>{stats.total_bookings}</b><span>Total jobs</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#fef3c7" }}>⏳</div>
            <div><b>{stats.pending}</b><span>Pending requests</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#d1fae5" }}>✅</div>
            <div><b>{stats.completed}</b><span>Completed</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#ede9fe" }}>⭐</div>
            <div>
              <b>{stats.avg_rating != null ? stats.avg_rating : "—"}</b>
              <span>Avg rating ({stats.total_reviews} reviews)</span>
            </div>
          </div>
        </div>
      )}

      <div className="split" style={{ marginTop: 26 }}>
        <div>
          <h2 style={{ fontSize: 19, marginBottom: 14 }}>🚨 New Requests ({pending.length})</h2>
          {bookings == null ? (
            <div className="spinner" />
          ) : pending.length === 0 ? (
            <div className="card empty-state" style={{ padding: 34 }}>
              <div className="e-icon">📭</div>
              <b>No pending requests</b>
              <p style={{ marginTop: 6 }}>New bookings will appear here in real time.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {pending.map((b) => (
                <div key={b.id} className="card" style={{ borderColor: "#fde68a", borderWidth: 1.5 }}>
                  <div className="booking-row">
                    <Avatar name={b.customer_name} />
                    <div className="booking-main">
                      <div className="svc">{b.service_icon} {b.service_name}</div>
                      <div className="addr">📍 {b.address}</div>
                      <div className="booking-meta">
                        <span>👤 {b.customer_name} · {b.customer_phone}</span>
                        {b.scheduled_time && <span>🕐 {b.scheduled_time.replace("T", " ")}</span>}
                      </div>
                      {b.lat && b.lng && (
                        <a className="btn btn-outline btn-sm" style={{ marginTop: 10 }} target="_blank" rel="noreferrer"
                          href={`https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`}>
                          🧭 Navigate to customer
                        </a>
                      )}
                    </div>
                    <div style={{ textAlign: "right", minWidth: 110 }}>
                      <div className="price-tag">₹{b.total_price}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                        <button className="btn btn-red btn-sm" onClick={() => update(b, "CANCELLED")}>Decline</button>
                        <button className="btn btn-green btn-sm" onClick={() => update(b, "ACCEPTED")}>Accept ✓</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ fontSize: 19, margin: "30px 0 14px" }}>🚗 In Progress ({active.length})</h2>
          {active.length === 0 ? (
            <div className="card empty-state" style={{ padding: 26 }}>No active jobs right now.</div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {active.map((b) => (
                <div key={b.id} className="card">
                  <div className="booking-row">
                    <div className="booking-main">
                      <div className="svc">{b.service_icon} {b.service_name} <StatusBadge status={b.status} /></div>
                      <div className="addr">📍 {b.address}</div>
                      <div className="booking-meta">
                        <span>👤 {b.customer_name} · {b.customer_phone}</span>
                        <span>#B{b.id}</span>
                      </div>
                      <StatusTimeline status={b.status} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <div className="price-tag">₹{b.total_price}</div>
                      {b.status === "ACCEPTED" && (
                        <button className="btn btn-primary btn-sm" onClick={() => update(b, "ON_THE_WAY")}>🚗 Start Journey</button>
                      )}
                      {b.status === "ON_THE_WAY" && (
                        <button className="btn btn-green btn-sm" onClick={() => update(b, "COMPLETED")}>✔ Complete Job</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ fontSize: 19, margin: "30px 0 14px" }}>📜 History ({done.length})</h2>
          {done.length === 0 ? (
            <div className="card empty-state" style={{ padding: 26 }}>No completed jobs yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {done.map((b) => (
                <div key={b.id} className="card" style={{ padding: 14 }}>
                  <div className="booking-row">
                    <div className="booking-main">
                      <div className="svc" style={{ fontSize: 14 }}>{b.service_icon} {b.service_name} <StatusBadge status={b.status} /></div>
                      <div className="addr">{b.address}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <b>₹{b.total_price}</b>
                      {b.reviewed && <div style={{ fontSize: 12, color: "var(--muted)" }}>⭐ rated by customer</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ alignSelf: "start", position: "sticky", top: 84 }}>
          <div className="card" style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>My Profile</h3>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar name={user.name} />
              <div>
                <b style={{ fontSize: 15 }}>{user.name}</b>
                <div className="role-pill mechanic" style={{ marginTop: 4 }}>Verified Mechanic</div>
              </div>
            </div>
            {mechanicProfile && (
              <div className="booking-meta" style={{ marginTop: 12 }}>
                <span>📍 {mechanicProfile.location_name}</span>
                <span>🛠 {mechanicProfile.skills || "All services"}</span>
                <span>📅 {mechanicProfile.years_experience} yrs</span>
              </div>
            )}
            <div style={{ marginTop: 12, background: "#f8fafc", borderRadius: 10, padding: 10, fontSize: 12.5, color: "var(--muted)" }}>
              💡 Accept requests fast — customers see your response rating in discovery.
            </div>
          </div>

          {stats && stats.total_reviews > 0 && (
            <div className="card">
              <h3 style={{ fontSize: 15, marginBottom: 10 }}>Rating breakdown</h3>
              {[5, 4, 3, 2, 1].map((n) => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, margin: "5px 0", fontSize: 12.5 }}>
                  <span style={{ minWidth: 22 }}>{n}★</span>
                  <div style={{ flex: 1, height: 8, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${stats.total_reviews ? (stats.rating_breakdown[n] / stats.total_reviews) * 100 : 0}%`, height: "100%", background: "#f59e0b" }} />
                  </div>
                  <span style={{ color: "var(--muted)", minWidth: 20 }}>{stats.rating_breakdown[n]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
