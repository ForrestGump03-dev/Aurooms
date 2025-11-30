# 🚀 Deployment Guide

## 📋 Pre-Deployment Checklist

Ensure you have completed the following:

- Admin Dashboard implementation
- Push Notifications implementation
- Successful build (`npm run build`)
- Database migration (local)
- Environment variables configured on Vercel
- Git push for deployment
- Production testing

---

## 🔑 Environment Variables (Vercel)

### Step 1: Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select project **aurooms**
3. Click **Settings** -> **Environment Variables**

### Step 2: Add Variables

Copy and paste these variables. **Replace values** with your actual secrets:

#### 🗄️ Database
```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

#### 💳 Stripe
```env
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

#### 📧 Email (Resend)
```env
RESEND_API_KEY="re_..."
```

#### 🔐 Admin Dashboard
```env
ADMIN_PASSWORD="YourSecurePassword123!"
JWT_SECRET="your-random-string-minimum-32-chars"
```

**Generate a secure JWT_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32
```

#### 🔔 Push Notifications
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your_vapid_public_key"
VAPID_PRIVATE_KEY="your_vapid_private_key"
VAPID_SUBJECT="mailto:admin@yourdomain.com"
```

### Step 3: Select Environments

For **every variable**, select all environments:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

---

## 🗄️ Database Migration (Neon/Production)

### Option 1: From Local (Recommended)

If you ran migrations locally with the correct connection string, the tables should already exist.

**Verify:**
```bash
psql "YOUR_DATABASE_URL"
\dt push_subscriptions
```

### Option 2: Remote Migration

If the tables do not exist in production:

1. **Open Neon Dashboard** → SQL Editor
2. **Run the following SQL:**

```sql
-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created ON push_subscriptions(created_at DESC);
```

---

## 🚀 Deploy to Vercel

### Option 1: Automatic (Git Push)

```bash
git add .
git commit -m "Release: Production ready"
git push origin main
```

### Option 2: Manual (Vercel Dashboard)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select **aurooms**
3. Go to **Deployments**
4. Click **Redeploy**

---

## 🧪 Post-Deploy Testing

### 1. Admin Dashboard
1. Navigate to `/admin`
2. Login with `ADMIN_PASSWORD`
3. Verify dashboard loads correctly

### 2. Push Notifications
1. In the dashboard, click **"Enable Notifications"**
2. Accept browser permissions
3. Verify the "Active" badge appears

### 3. Booking Flow
1. Make a test booking (using Stripe test card)
2. Verify email confirmation
3. Verify push notification receipt

---

## 🔧 Troubleshooting

### Deploy fails with "Module not found"
Ensure all dependencies are in `package.json`.
```bash
npm install
git add package.json package-lock.json
git commit -m "Fix dependencies"
git push
```

### Admin 401 Unauthorized
Check `ADMIN_PASSWORD` and `JWT_SECRET` in Vercel Environment Variables.

### Push Notification Errors
Verify VAPID keys are correctly set in Vercel. Ensure `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is accessible to the client.
