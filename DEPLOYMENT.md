# Vercel Deployment Guide for Lab Pulse

## Issues Fixed

The deployment was failing with "500 func invocation failed" error due to:

1. **Wrong Database Import**: The API (`src/server/app.ts`) was importing the old in-memory `db.ts` module instead of using Firebase Firestore services
2. **Firebase Client-Side SDK in Serverless**: Firebase client SDK needs proper initialization in serverless environment
3. **Missing Environment Configuration**: Vercel needs specific function settings for proper execution

## Changes Made

### 1. Updated Server App to Use Firebase (`src/server/app.ts`)
- ✅ Changed from `import { db } from './db'` to `import * as firestoreService from '../services/firestoreService'`
- ✅ Converted all database operations to async Firebase calls
- ✅ Added proper error handling for all endpoints
- ✅ All routes now use Firebase Firestore through `firestoreService`

### 2. Firebase Configuration
Your Firebase setup is already configured:
- Project ID: `xanthic-basis-9cf5x`
- Firestore Database: `ai-studio-labpulse-7445edf1-4a8c-44a2-a1ee-efd3531ed616`
- Config file: `firebase-applet-config.json`

### 3. Vercel Configuration (`vercel.json`)
- Added `functions` configuration with 1024MB memory
- Set 10-second timeout for API routes
- Proper API routing configured

### 4. Serverless Handler (`api/index.ts`)
- Improved error logging with stack traces
- Better initialization handling
- Proper 500 error responses

## Environment Variables Required

Firebase configuration is already in `firebase-applet-config.json`, but you still need:

**Set these in Vercel Dashboard → Settings → Environment Variables:**

```bash
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="https://your-app.vercel.app"
NODE_ENV="production"
```

**Optional (if using Gemini AI features):**
```bash
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="https://your-app.vercel.app"
```

## Deployment Steps

1. **Commit and Push Changes**:
   ```bash
   git add .
   git commit -m "Fix: Use Firebase Firestore instead of in-memory DB"
   git push
   ```

2. **Set Environment Variables in Vercel**:
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all required variables above
   - Apply to: Production, Preview, and Development

3. **Deploy**:
   - Vercel will auto-deploy on push, or
   - Manually trigger from Deployments tab

4. **Test the API**:
   ```bash
   # Health check
   curl https://your-app.vercel.app/api/health
   
   # Get schools data
   curl https://your-app.vercel.app/api/schools
   ```

5. **Check Logs if Issues Persist**:
   - Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment
   - Functions tab → `/api/index` → View Logs

## Data Persistence

✅ **Using Firebase Firestore**: All data is now persisted in your Firebase project
- Project: `xanthic-basis-9cf5x`
- Database: `ai-studio-labpulse-7445edf1-4a8c-44a2-a1ee-efd3531ed616`
- Data survives deployments and function cold starts
- Includes in-memory fallback for offline development

### Seeding Firebase
The Firebase service (`src/services/firestoreService.ts`) automatically seeds your Firestore database with initial data on first run if it's empty. This includes:
- 3 sample schools
- 4 users (1 admin, 3 entry users)
- 14 days of sample entries
- 1 experiment window

### API Routes
All API endpoints are available at:
- `/api/health` - Health check
- `/api/auth/login` - Authentication
- `/api/schools` - Schools data
- `/api/entries` - Daily entries
- `/api/experiments` - Experiment windows
- `/api/users` - User management (admin only)
- `/api/reports/weekly` - Weekly reports

### Monitoring Logs
View real-time logs in Vercel:
1. Go to your deployment
2. Click "Functions" tab
3. Select `/api/index`
4. View logs for debugging

## Troubleshooting

### Still Getting 500 Errors?

1. **Check Vercel Logs**:
   - Deployment → Functions → /api/index → View Logs
   - Look for the actual error message

2. **Check Environment Variables**:
   - Ensure `NEXTAUTH_SECRET` is set (required for JWT)
   - Ensure all variables are in Production environment

3. **Check Build Logs**:
   - Deployment → Build Logs
   - Ensure the build completes successfully

4. **Test Locally First**:
   ```bash
   npm run dev
   # Test at http://localhost:3000
   ```

### Common Errors

**"Cannot find module"**
- Ensure all dependencies are in `dependencies`, not `devDependencies`
- Run `npm install` locally to verify

**"JWT secret not set"**
- Add `NEXTAUTH_SECRET` environment variable in Vercel

**"CORS errors"**
- The API already has CORS enabled for all origins (`*`)
- If issues persist, check browser console for specific CORS error

## Next Steps

1. ✅ Deploy and test basic functionality
2. 🔄 Migrate to persistent database (Vercel Postgres recommended)
3. 🔒 Restrict CORS to your specific domain in production
4. 📊 Set up monitoring and error tracking (Sentry, LogRocket)
5. 🚀 Add caching layer (Redis/Vercel KV) for better performance

## Support

If you continue to see errors:
1. Check Vercel function logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test API endpoints individually to isolate the issue
4. Consider enabling verbose logging by adding `console.log` statements
