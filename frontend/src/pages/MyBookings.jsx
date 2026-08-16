import React, { useEffect, useState } from "react";
import { api } from "../api";
import { StatusBadge, StatusTimeline, Stars } from "../components/ui";
import { useToast } from "../context/ToastContext";

function ReviewModal({ booking, onClose, onDone }) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await api.createReview(booking.id, { rating, comment });
      toast("Thanks for your review! ⭐", "success");
      onDone();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Rate your service</h2>
        <p className="m-sub">{booking.mechanic_name} · {booking.service_name}</p>
        <div className="rating-input" style={{ marginTop: 18 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={n <= rating ? "on" : ""} onClick={() => setRating(n)}>★</span>
          ))}
        </div>
        <label className="label">Your feedback</label>
        <textarea className="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was the service? Professional? On time?" />
        <button className="btn btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={submit} disabled={busy}>
          {busy ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}

export default function MyBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState(null);
  const [reviewing, setReviewing] = useState(null);

  const load = () => {
    api.myBookings()
      .then(setBookings)
      .catch(() => toast("Failed to load bookings", "error"));
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = async (b) => {
    try {
      await api.updateStatus(b.id, "CANCELLED");
      toast("Booking cancelled", "info");
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div className="container">
      <div className="page-title">
        <h1>My Bookings</h1>
        <p>Live status tracking — refreshes automatically every 5 seconds 🔄</p>
      </div>

      {!bookings ? (
        <div className="spinner" />
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="e-icon">🧾</div>
          <b>No bookings yet</b>
          <p>Go to <b>Find Mechanic</b> and book your first AC service!</p>
        </div>
      ) : (
        <div className="dash-grid">
          {bookings.map((b) => (
            <div key={b.id} className="card">
              <div className="booking-row">
                <div className="booking-main">
                  <div className="svc">{b.service_icon} {b.service_name} <StatusBadge status={b.status} /></div>
                  <div className="addr">📍 {b.address}</div>
                  {b.notes && <div className="note">📝 “{b.notes}”</div>}
                  <div className="booking-meta">
                    <span>🔧 {b.mechanic_name} · {b.mechanic_phone}</span>
                    {b.scheduled_time && <span>🕐 {b.scheduled_time.replace("T", " ")}</span>}
                    <span>#B{b.id}</span>
                  </div>
                  <StatusTimeline status={b.status} />
                </div>
                <div style={{ textAlign: "right", minWidth: 120 }}>
                  <div className="price-tag" style={{ fontSize: 21 }}>₹{b.total_price}</div>
                  <div className="booking-actions" style={{ justifyContent: "flex-end" }}>
                    {b.status === "PENDING" && (
                      <button className="btn btn-red btn-sm" onClick={() => cancel(b)}>Cancel</button>
                    )}
                    {b.status === "ON_THE_WAY" && b.lat && b.lng && (
                      <a
                        className="btn btn-primary btn-sm"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`}
                      >
                        🗺 Track on Map
                      </a>
                    )}
                    {b.status === "COMPLETED" && !b.reviewed && (
                      <button className="btn btn-green btn-sm" onClick={() => setReviewing(b)}>⭐ Rate Service</button>
                    )}
                    {b.status === "COMPLETED" && b.reviewed && (
                      <span className="badge badge-COMPLETED">✓ Reviewed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewing && (
        <ReviewModal
          booking={reviewing}
          onClose={() => setReviewing(null)}
          onDone={() => { setReviewing(null); load(); }}
        />
      )}
    </div>
  );
}
