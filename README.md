
# CityRide Connect v3 — MERN (Vite React JS + Node/Express + MongoDB)

## Features
- Email/password auth (JWT)
- Forgot/reset password using **EmailJS** (frontend) + token issuance (backend)
- Roles: user / owner / admin (admin requires approval)
- Vehicle vetting (doc URLs) + admin approval
- Hyderabad-only geofence for ride posting (backend enforced)
- Booking + 12% commission split (admin/owner)
- Complaints (female passenger safety) + admin review
- Razorpay order creation
- Minimal UI for fast rendering

## Structure
- `frontend/` Vite React (JavaScript)
- `backend/` Node/Express + MongoDB (Mongoose)

## Quick Start
### Backend
```
cd backend
cp .env.example .env
# Fill MONGODB_URI, JWT_SECRET, RAZORPAY keys, ORIGIN
npm i
npm run dev
```
### Frontend
```
cd frontend
npm i
# Optional: set EmailJS ids
# VITE_EMAILJS_SERVICE_ID=...
# VITE_EMAILJS_TEMPLATE_ID=...
# VITE_EMAILJS_PUBLIC_KEY=...
npm run dev
```
Frontend proxies `/api` to `http://localhost:8080`.

## Notes
- Admin endpoints require role 'admin'. Promote a user by directly updating DB user.role = 'admin' for now.
- Uploading real files is out-of-scope here; store document links (rcUrl/insuranceUrl/licenseUrl).
- Expand dashboards to call these APIs as you iterate.
