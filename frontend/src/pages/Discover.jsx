import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import MapView from "../components/MapView";
import BookModal from "../components/BookModal";
import { Stars } from "../components/ui";
import { useToast } from "../context/ToastContext";

const CHENNAI = { lat: 13.0827, lng: 80.2707 };

export default function Discover() {
  const { toast } = useToast();
  const [mechanics, setMechanics] = useState(null);
  const [location, setLocation] = useState(null);
  const [locName, setLocName] = useState("Chennai");
  const [locating, setLocating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [bookingMech, setBookingMech] = useState(null);
  const [filter, setFilter] = useState("");

  const locate = () => {
    if (!navigator.geolocation) {
      setLocation(CHENNAI);
      toast("Geolocation unavailable — using Chennai", "info");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setLocating(false);
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}&zoom=14`);
          const j = await r.json();
          if (j && j.display_name) setLocName(j.display_name.split(",").slice(0, 3).join(","));
        } catch { setLocName("Your location"); }
      },
      (err) => {
        setLocation(CHENNAI);
        setLocating(false);
        toast("Could not fetch location — using Chennai (demo)", "info");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!location) return;
    let alive = true;
    api.nearbyMechanics(location.lat, location.lng, 20)
      .then((data) => alive && setMechanics(data))
      .catch(() => toast("Failed to load mechanics", "error"));
    return () => { alive = false; };
  }, [location, toast]);

  const filtered = useMemo(() => {
    if (!mechanics) return [];
    if (!filter) return mechanics;
    const q = filter.toLowerCase();
    return mechanics.filter((m) =>
      [m.name, m.skills, m.location_name, m.bio].some((s) => (s || "").toLowerCase().includes(q))
    );
  }, [mechanics, filter]);

  const colorFor = (name) => {
    const hues = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#6366f1", "#0891b2"];
    return hues[(name || "?").length % hues.length];
  };

  return (
    <div className="container">
      <div className="page-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Find your AC mechanic 🔧</h1>
          <p>Verified technicians around <b>{locName}</b></p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={locate} disabled={locating}>
          {locating ? "Locating..." : "📍 Use my live location"}
        </button>
      </div>

      {!mechanics ? (
        <div className="spinner" />
      ) : mechanics.length === 0 ? (
        <div className="empty-state"><div className="e-icon">📡</div>No mechanics found in this area. Try widening your radius.</div>
      ) : (
        <div className="split">
          <div>
            <input
              className="input"
              placeholder="🔍 Search by name, skill or area..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: "grid", gap: 14 }}>
              {filtered.map((m) => (
                <div
                  key={m.user_id}
                  className={`mech-card ${selected && selected.user_id === m.user_id ? "selected" : ""}`}
                  onClick={() => setSelected(m)}
                >
                  <div className="m-avatar-lg" style={{ background: colorFor(m.name) }}>{m.name[0]}</div>
                  <div className="mech-info">
                    <div className="name-row">
                      <h3>{m.name}</h3>
                      {m.verified && <span className="verified-tag">✓ Verified</span>}
                    </div>
                    <Stars rating={m.rating} count={m.reviews_count} />
                    <div className="mech-meta">
                      <span>📍 {m.location_name}</span>
                      <span>🛠 {m.skills || "All AC services"}</span>
                      <span>📅 {m.years_experience} yrs exp</span>
                      {m.distance_km != null && <span>🚶 {m.distance_km} km</span>}
                    </div>
                    {m.bio && <p className="mech-bio">{m.bio}</p>}
                  </div>
                  <div className="mech-right">
                    <div className="price-tag">
                      ₹{m.base_fee}
                      <small>visit charge</small>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); setBookingMech(m); }}>
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card map-card" style={{ position: "sticky", top: 84, alignSelf: "start" }}>
            <div className="map-title">🗺 Live mechanic map ({mechanics.length} nearby)</div>
            <MapView
              center={location ? [location.lat, location.lng] : [CHENNAI.lat, CHENNAI.lng]}
              mechanics={mechanics}
              selectedId={selected && selected.user_id}
              onSelect={(m) => setSelected(m)}
            />
            {selected && (
              <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", fontSize: 13.5, color: "var(--muted)" }}>
                <b style={{ color: "var(--ink)" }}>{selected.name}</b> · {selected.location_name} ·{" "}
                <Stars rating={selected.rating} count={selected.reviews_count} />
                <span style={{ float: "right" }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setBookingMech(selected)}>Book {selected.name.split(" ")[0]} →</button>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {bookingMech && (
        <BookModal
          mechanic={bookingMech}
          onClose={() => setBookingMech(null)}
          onBooked={() => setBookingMech(null)}
        />
      )}
    </div>
  );
}
