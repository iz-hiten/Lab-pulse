# Lab Pulse — Digital Education Field Operations & Monitoring Platform

**Lab Pulse** is a zero-config, production-grade field intelligence and monitoring platform designed for digital education programs across remote and partner schools. It replaces fragmented WhatsApp logs and static spreadsheets with real-time operational analytics, automated anomaly detection, and mobile-optimized reporting.

---

## ⚡ Key Architectural Highlights

- **Vercel & Serverless Ready**: Full serverless adapter (`/api/index.ts`) paired with standard Express (`server.ts`) and Vite standard build config (`vercel.json`).
- **Zero-Setup Database Engine**: Runs out of the box with an in-memory SQLite/JSON hybrid database pre-populated with realistic 14-day field data for friction-free evaluation.
- **Sub-60s Mobile Entry Workflow**: Custom stepper controls, single-tap session status buttons, and 1-5 emoji engagement scales built specifically for low-tier mobile devices.
- **100-Point Weighted Health Score Index**: Composite metric combining Session Uptime (40%), Attendance (30%), and Engagement (30%) with color-coded risk indicators (Green/Amber/Red).
- **A/B Experiment Impact Tracker**: Measures baseline vs. intervention periods with shaded trend overlays on interactive Recharts charts.
- **Executive Summary Generator**: One-click plain-text summary generator with Copy-to-Clipboard and `.TXT` file download functionality for C-suite updates and Slack broadcasts.
- **Guided Onboarding Tour**: Built-in 5-step guided tour explaining every view and operational capability.

---

## 🚀 Deploying to Vercel

Lab Pulse includes all configuration files needed for instant Vercel deployment:

### Step 1: Push Repository to GitHub
```bash
git add .
git commit -m "Deploy Lab Pulse to Vercel"
git push origin main
```

### Step 2: Import into Vercel
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Select your GitHub repository.
4. **Framework Preset**: Select **Vite** (or Other).
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Click **Deploy**.

Vercel will automatically detect `vercel.json` and deploy both the serverless API endpoints (`/api/*`) and the static React frontend.

---

## 🛠️ Local Development & Scripts

- `npm run dev`: Starts the local Express + Vite dev server on `http://localhost:3000`.
- `npm run build`: Bundles the Vite React app and compiles the Express server for production.
- `npm run start`: Launches the compiled production server.
- `npm run lint`: Runs TypeScript strict type checker.

---

## 👑 Demo Role Switcher

Use the top-navigation **Demo Role** dropdown to switch between:
1. **Teacher (Marcus Vance — Oakridge)**: Mobile entry view with assigned school context.
2. **Teacher (Amina Nkosi — Sunrise)**: Alternate partner school entry mode.
3. **Admin Manager (Priya Sharma)**: Full program analytics, user management, and experiment tracking.

---

*Built for Job Submission & Field Operations Excellence.*
