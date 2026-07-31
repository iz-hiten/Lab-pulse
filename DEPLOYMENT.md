# Vercel Deployment Guide for Lab Pulse

## Issues Fixed

The original deployment was failing with "500 func invocation failed" error due to:

1. **File System Operations**: The database (`src/server/db.ts`) was using Node.js `fs` module to persist data to disk, which doesn't work reliably in Vercel's serverless environment.
2. **Missing Serverless Configuration**: The API handler needed proper memory and timeout settings.
3. **Cold Start Issues**: Express app initialization timing in serverless functions.

## Changes Made

### 1. Database Storage (src/server/db.ts)
- Changed from file-based storage to in-memory storage
- Data persists during the serverless function's lifecycle
- **Note**: Data will reset when the function cold-starts. For production, consider:
  - Using Vercel Postgres
  - Using Firebase Firestore
  - Using any external database service

### 2. Vercel Configuration (vercel.json)
- Added `functions` configuration with increased memory (1024MB) and timeout (10s)
- Configured proper API routing

### 3. API Handler (api/index.ts)
- Improved error handling and logging
- Lazy initialization of Express app
- Better error messages for debugging

## Environment Variables Required

Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="https://your-app.vercel.app"
GEMINI_API_KEY="your-gemini-api-key" # Optional, if using AI features
APP_URL="https://your-app.vercel.app"
```

## Deployment Steps

1. **Push your changes to GitHub**:
   ```bash
   git add .
   git commit -m "Fix serverless deployment issues"
   git push
   ```

2. **In Vercel Dashboard**:
   - Go to your project
   - Settings → Environment Variables
   - Add all required environment variables
   - Redeploy from Deployments tab

3. **Test the API**:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

## Important Notes

### Data Persistence
⚠️ **Current Setup**: Data is stored in-memory and will reset on cold starts (every ~5-15 minutes of inactivity).

**For Production**, migrate to a real database:

#### Option A: Vercel Postgres
```bash
# Install Prisma
npm install @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init

# Update schema.prisma with your models
# Run migrations
npx prisma migrate dev
```

#### Option B: Firebase Firestore
You already have `src/services/firestoreService.ts` - consider using it for backend storage too.

#### Option C: External Database
- Supabase
- PlanetScale
- MongoDB Atlas
- Any PostgreSQL/MySQL provider

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
