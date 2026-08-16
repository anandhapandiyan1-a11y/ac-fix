import React, { useState } from "react";
import { api } from "../api";
import { useToast } from "../context/ToastContext";

export default function BookModal({ mechanic, onClose, onBooked }) {
  const { toast } = useToast();
  const [services, setServices] = useState(null);
  const [service, setService] = useState(null);
  const [scheduled, setScheduled] = useState("");
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  React.useEffect(() => {
    api.services().then(setServices).catch(() => toast("Could not load services", "error"));
  }, [toast]);

  React.useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setAddress(`My location · ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`),
      () => setAddress("12, Anna Salai, Chennai"),
      { timeout: 5000 }
    );
  }, []);

  const total = service ? service.base_price + (mechanic.base_fee || 0) : 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!service) return setErr("Please select a service");
    setErr("");
    setBusy(true);
    try {
      let lat = 13.0827, lng = 80.2707;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch { /* keep default */ }
      }
      const booking = await api.createBooking({
        mechanic_id: mechanic.user_id,
        service_id: service.id,
        address,
        lat,
        lng,
        scheduled_time: scheduled,
        notes,
        total_price: total,
      });
      toast(`Booking #${booking.id} placed — ₹${booking.total_price}`, "success");
      onBooked(booking);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Book {mechanic.name}</h2>
        <p className="m-sub">
          {mechanic.location_name} · {mechanic.distance_km != null ? `${mechanic.distance_km} km away` : "nearby"}
          {mechanic.rating != null && <> · ⭐ {mechanic.rating}</>}
        </p>

        <form onSubmit={submit}>
          <label className="label">Choose Service</label>
          {!services && <div className="spinner" style={{ margin: "20px auto" }} />}
          <div style={{ display: "grid", gap: 10 }}>
            {(services || []).map((s) => (
              <div key={s.id} className={`service-chip ${service && service.id === s.id ? "active" : ""}`} onClick={() => setService(s)}>
                <div className="svc-name">{s.icon} {s.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span className="svc-price">₹{s.base_price}</span>
                  <span className="svc-time">⏱ {s.estimated_time}</span>
                </div>
              </div>
            ))}
          </div>

          <label className="label">Address (auto-shared)</label>
          <input className="input" required value={address} onChange={(e) => setAddress(e.target.value)} />

          <label className="label">Preferred Time</label>
          <input className="input" type="datetime-local" value={scheduled} onChange={(e) => setScheduled(e.target.value)} />

          <label className="label">Notes for mechanic</label>
          <textarea className="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. AC not cooling, split unit on 2nd floor" />

          <div style={{ marginTop: 16, background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 12, padding: "6px 14px" }}>
            <div className="price-line"><span>Service fee</span><span>₹{service ? service.base_price : 0}</span></div>
            <div className="price-line"><span>Visit charge ({mechanic.location_name})</span><span>₹{mechanic.base_fee || 0}</span></div>
            <div className="price-line total"><span>Total (no hidden charges)</span><span>₹{total}</span></div>
          </div>

          {err && <div className="err-msg">{err}</div>}

          <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }} disabled={busy || !service}>
            {busy ? "Booking..." : `Confirm Booking · ₹${total}`}
          </button>
        </form>
      </div>
    </div>
  );
}
