# 🔐 Admin Dashboard Guide

## 📋 Overview

The Admin Dashboard provides a complete interface for managing AuRooms bookings.

### ✅ Features

1. **Secure Authentication** (`/admin/login`)
   - Password protection
   - Rate limiting (5 attempts → 1 hour block)
   - JWT Tokens (24h validity)

2. **Dashboard** (`/admin/dashboard`)
   - Booking overview
   - Statistics (Total bookings, Revenue, Upcoming check-ins)
   - Search & Filter (Name, Email, Booking #, Room)
   - CSV Export
   - Booking Management (Delete, View Details)

3. **Protected APIs**
   - `GET /api/admin/bookings`
   - `DELETE /api/admin/bookings/[id]`
   - `POST /api/admin/bookings` (Future use)

---

## 🚀 Initial Setup

### 1️⃣ Environment Variables

Add these to your `.env` or Vercel configuration:

```env
ADMIN_PASSWORD="YourSecurePassword123!"
JWT_SECRET="long-random-string-minimum-32-chars"
```

### 2️⃣ Access

- **URL:** `https://yourdomain.com/admin`
- **Credentials:** Use the password defined in `ADMIN_PASSWORD`.

---

## 📊 Usage

### Viewing Bookings
- **All bookings** are listed in the main table.
- **Statistics** at the top show real-time data.

### Search & Filter
- Use the search bar for Client Name, Email, or Booking ID.
- Use the dropdown to filter by Room Type.

### Actions

#### 👁️ View Details
Click the eye icon to see full booking details, including special requests and contact info.

#### 🗑️ Delete Booking
Click the red trash icon to permanently remove a booking. **Warning:** This action cannot be undone.

#### 📥 Export CSV
Click "Export CSV" to download a spreadsheet of the currently filtered view.

---

## 🔔 Push Notifications

The dashboard supports Web Push Notifications.

- **Enable:** Click the bell icon/button in the dashboard.
- **Function:** Receives alerts for new bookings even when the browser is closed (background sync).
- **Requirements:** Supported browser (Chrome, Edge, Firefox, Safari) and HTTPS.

---

## 🔐 Security Features

- **Brute Force Protection:** Account locks for 1 hour after 5 failed attempts.
- **Session Timeout:** Tokens expire automatically after 24 hours.
- **Secure Headers:** HTTPOnly cookies and secure headers are enforced.

---

## 📱 Mobile Access

The dashboard is fully responsive and works on:
- iPhone/Android
- Tablets
- Desktop
