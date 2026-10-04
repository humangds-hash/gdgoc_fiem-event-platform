# 🚀 GDG Event Platform & Check-in System

A modern, full-stack Event Management & Gate Check-in Platform built for **Google Developer Groups (GDG)**. Featuring instant event registration, QR ticket generation, real-time ticket scanning, attendee verification, and a comprehensive admin portal.

---

## ✨ Features

- **🌐 Modern Event Showcase**: GDG brand-inspired UI with hero section, live countdown, upcoming tech sessions, speaker cards, and community links.
- **🎟️ Instant Ticket Registration**: Attendee registration with auto-generated unique Pass IDs and dynamic QR codes.
- **📧 Automated Email Confirmations**: Nodemailer SMTP integration to dispatch confirmed ticket details and QR codes directly to attendees' inboxes.
- **📷 Gate Check-in QR Scanner**: Built-in camera scanner with fallback text/search entry. Supports instant barcode detection, duplicate scan prevention, attendee verification card (photo, name, role, email, pass ID), and scan rollback/undo.
- **⚙️ Admin Portal (`/admin`)**:
  - Live analytics on registrations, check-in rate, and gate metrics.
  - Searchable and filterable Attendee Table with manual check-in toggles.
  - CSV export of attendee lists.
  - **Speaker & Team Management**: Add new speakers or edit existing profiles, upload custom photos (base64 or URLs), and link LinkedIn & Twitter profiles.
- **💾 Dual Storage Strategy**: Seamless Supabase PostgreSQL database integration with resilient local browser state fallback.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: Lucide React & Custom Brand SVGs
- **QR Code**: `qrcode.react` & `html5-qrcode`
- **Email Delivery**: Nodemailer (Gmail / Custom SMTP)
- **Database (Optional)**: Supabase PostgreSQL
- **Deployment**: Optimized for [Vercel](https://vercel.com/)

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone <your-repository-url>
cd gdg-platform
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration:
```env
# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# SMTP Email Dispatch (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-google-app-password
EMAIL_FROM=GDG Platform <your-email@gmail.com>

# Supabase Database (Optional - for cloud persistence)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the website, or [http://localhost:3000/admin](http://localhost:3000/admin) for the organizer dashboard.

---

## ☁️ Deployment Guide (Vercel)

The easiest way to deploy this project is using **Vercel** (the creators of Next.js):

1. **Push your code to GitHub** (see instructions below).
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository.
4. (Optional) In the **Environment Variables** section, paste the values from your `.env.local`.
5. Click **Deploy**. Vercel will automatically build and publish your site with a free HTTPS domain!
