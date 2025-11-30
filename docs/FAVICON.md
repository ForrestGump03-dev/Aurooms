# 🎨 Favicon & Branding Guide

## 🎯 Overview

This guide explains how to update the website's favicon and icons to ensure consistent branding across devices and search results.

## 📍 File Requirements

To fully support all devices (Desktop, Android, iOS), the following files are required in `src/app/`:

- `favicon.ico` (32x32px or multi-size)
- `icon.png` (192x192px) - For Android/Chrome
- `apple-icon.png` (180x180px) - For iOS devices

## 🛠️ Generation Tools

Recommended tools to generate these assets from a source logo:
1. [RealFaviconGenerator](https://realfavicongenerator.net/) (Best for comprehensive suites)
2. [Favicon.io](https://favicon.io/)

## ⚙️ Configuration

The `layout.tsx` file is configured to look for these files:

```typescript
export const metadata: Metadata = {
  // ...
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
};
```

## 🚀 Deployment & Indexing

1. **Replace Files:** Overwrite the existing placeholder images in `src/app/`.
2. **Deploy:** Push changes to production.
3. **Cache:** Clear browser cache to see changes immediately.
4. **Google:** Use Google Search Console to request re-indexing if the icon doesn't update in search results within a few days.
