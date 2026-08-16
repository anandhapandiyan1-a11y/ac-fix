# ❄ AC-Fix — Local AC Service & Mechanic Finder

**FALL INTO TECHVERSE Hackathon Project** · Team Head: T. Raja Kamala Kannan · EduMentor AI

Bridging residential customers with verified local AC technicians through **transparent pricing**, **real-time reviews** and **instant location-based dispatch**.

---

## ✨ Features (per the proposal)

| Module | What it does |
|---|---|
| **Dual-user ecosystem** | Role-based auth — Customer 🏠 / Mechanic 🔧 (JWT) |
| **Customer portal** | Browse & filter verified mechanics, ratings, reviews, service portfolios |
| **Location discovery** | Live geolocation (OpenStreetMap/Nominatim) + distance-based sorting |
| **Transparent pricing** | Fixed service catalog + visit charge shown upfront — no hidden costs |
| **Instant booking** | One-click booking with auto address sharing |
| **Automated dispatch** | New job instantly appears on mechanic dashboard (with browser notification) |
| **Live status tracking** | Pending → Accepted → On the Way → Completed (auto-refresh + timeline UI) |
| **Map navigation** | 1-click Google Maps route to customer doorstep |
| **Reviews & ratings** | 1–5 star rating + feedback after completion; feedback loop into mechanic rating |
| **Mechanic stats** | Job counts, completion rate, rating breakdown |

## 🧰 Tech Stack

- **Frontend:** React 18 + Vite + React Router + React-Leaflet (OpenStreetMap)
- **Backend:** Python FastAPI + SQLAlchemy
- **Database:** SQLite (swap to PostgreSQL easily — same SQLAlchemy models)
- **Auth:** JWT (python-jose) + bcrypt
- **Location:** Browser Geolocation API + Nominatim reverse geocoding + OSM tiles

## 🚀 Quick Start (Windows)

```bat
start.bat
```

Or manually in two terminals:

```bash
# Terminal 1 — Backend (port 8000)
cd backend
..\myenv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Then open **http://localhost:5173**

### Demo accounts (password: `demo1234`)

| Role | Email | What to demo |
|---|---|---|
| 🏠 Customer | `customer@demo.com` | Discover → Book → Track → Review |
| 🔧 Mechanic | `mechanic@demo.com` | Accept job → On the way → Complete |

8 seeded mechanics around Chennai (T. Nagar, Kodambakkam, Anna Nagar…) + 5 service categories.

## 🎯 Jury Demo Flow (3 minutes)

1. **Landing** — pitch the problem + dual-user concept (hero shows live dispatch feed)
2. **Login as mechanic** → dashboard starts with 0 jobs (`mechanic@demo.com`)
3. **Login as customer** (2nd browser/incognito) → live location detected, mechanics list with ratings & distance, map with markers
4. **Book** Ravi Kumar (5★) → transparent price shown (service fee + visit charge)
5. **Back to mechanic** → new request notification pops with route navigation → Accept → 🚗 Start Journey → ✔ Complete
6. **Back to customer** → timeline green, rate 5★ with comment
7. **Re-check mechanic** → rating 5.0 with breakdown chart

## 📁 Project Structure

```
acfix/
├── start.bat                  # One-click launcher
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + routing
│   │   ├── models.py          # User, MechanicProfile, Service, Booking, Review
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── auth.py            # JWT + bcrypt
│   │   ├── geo.py             # Haversine distance
│   │   ├── seed.py            # Demo data
│   │   └── routers/           # auth, services, mechanics, bookings, reviews
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/             # Landing, Login, Register, Discover, MyBookings, MechanicDashboard
        ├── components/        # MapView, BookModal, Navbar, UI kit
        ├── context/           # AuthContext, ToastContext
        └── api.js             # Fetch wrapper
```

## 🗺 API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register (customer/mechanic) |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Current user + profile |
| GET | `/api/services` | Service catalog with prices |
| GET | `/api/mechanics?lat&lng&radius_km` | Nearby mechanics sorted by distance |
| GET | `/api/mechanics/{id}` | Mechanic detail + reviews |
| POST | `/api/bookings` | Create booking (customer) |
| GET | `/api/bookings/my` | My bookings (both roles) |
| PATCH | `/api/bookings/{id}/status` | Status transitions (role-guarded) |
| GET | `/api/bookings/stats` | Dashboard stats |
| POST | `/api/reviews?booking_id=` | Submit review (completed only) |

Interactive docs: **http://127.0.0.1:8000/docs**

## 🚀 Future Scope

Multi-service scaling (electricians, plumbers) · UPI payments · 6-month maintenance reminders · social impact for unorganized local mechanics.