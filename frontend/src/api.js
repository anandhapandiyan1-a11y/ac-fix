const API = "/api";

function getToken() {
  return localStorage.getItem("acfix_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("acfix_token", token);
  else localStorage.removeItem("acfix_token");
}

export function setUser(user) {
  if (user) localStorage.setItem("acfix_user", JSON.stringify(user));
  else localStorage.removeItem("acfix_user");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("acfix_user"));
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.detail || `Request failed (${res.status})`);
    err.status = res.status;
    if (res.status === 401) {
      setToken(null);
      setUser(null);
      window.location.href = "/login";
    }
    throw err;
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),

  services: () => request("/services"),
  nearbyMechanics: (lat, lng, radius) =>
    request(`/mechanics?lat=${lat}&lng=${lng}&radius_km=${radius || 20}`),
  mechanicDetail: (id) => request(`/mechanics/${id}`),

  createBooking: (payload) => request("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  myBookings: () => request("/bookings/my"),
  updateStatus: (id, status) =>
    request(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  myStats: () => request("/bookings/stats"),

  createReview: (bookingId, payload) =>
    request(`/reviews?booking_id=${bookingId}`, { method: "POST", body: JSON.stringify(payload) }),
};
