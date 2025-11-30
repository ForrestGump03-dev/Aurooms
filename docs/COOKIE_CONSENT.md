# 🍪 Cookie Consent & Analytics

## 🔍 Overview

This project implements a GDPR-compliant cookie consent mechanism. User privacy is prioritized: analytics are **disabled by default** until the user explicitly consents.

---

## 📊 Consent Logic

### Scenario 1: User ACCEPTS Analytics

**Storage:**
```javascript
localStorage: {
  necessary: true,
  analytics: true
}
```

**Data Collected:**
- **Vercel Analytics:** Page views, device type, country (anonymized).
- **Vercel Speed Insights:** Core Web Vitals (LCP, FID, CLS).

**Implementation:**
The `CookieBanner` component triggers `window.va('event', 'consent_granted')`, which initializes the Vercel Analytics script.

### Scenario 2: User REJECTS Analytics (Essential Only)

**Storage:**
```javascript
localStorage: {
  necessary: true,
  analytics: false
}
```

**Data Collected:**
- **None.** No analytics scripts are loaded.

**Essential Cookies (Always Active):**
These are strictly necessary for the website to function and do not require consent under GDPR (Art. 6.1.f - Legitimate Interest).
1.  **Stripe:** Fraud detection and payment processing (`__stripe_mid`, `__stripe_sid`).
2.  **Session:** Booking state management.
3.  **Preferences:** Storing the consent choice itself.

---

## 🧪 Testing

### Verify Rejection
1. Clear `localStorage`.
2. Reload page.
3. Click **"Essential Only"**.
4. Check Network tab: No requests to `/_vercel/insights`.

### Verify Acceptance
1. Clear `localStorage`.
2. Reload page.
3. Click **"Accept All"**.
4. Check Network tab: Requests to `/_vercel/insights` should appear.

---

## 📝 Privacy Policy

The `/privacy` page has been updated to reflect this technical implementation, detailing:
- Types of cookies used.
- Third-party processors (Stripe, Vercel).
- Data retention and anonymization.
