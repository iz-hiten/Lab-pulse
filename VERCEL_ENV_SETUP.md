# Vercel Environment Variables Setup Guide

## Required Environment Variables

### 1. NEXTAUTH_SECRET (REQUIRED)
**Purpose**: Used for signing JWT tokens for authentication

**Value**: A random string of at least 32 characters

**Generate a secure secret**:
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Use this example (CHANGE IN PRODUCTION!)
labpulse-secret-key-2026-change-this-to-something-random-and-secure
```

**Add to Vercel**:
```
Key: NEXTAUTH_SECRET
Value: your-generated-secret-here-minimum-32-characters-long
```

---

### 2. NEXTAUTH_URL (REQUIRED)
**Purpose**: The base URL of your deployed application

**Value**: Your Vercel deployment URL

**Examples**:
```
# Production
https://lab-pulse.vercel.app

# Or your custom domain
https://labpulse.com
```

**Add to Vercel**:
```
Key: NEXTAUTH_URL
Value: https://your-app.vercel.app
```

---

### 3. NODE_ENV (RECOMMENDED)
**Purpose**: Tells Node.js the environment it's running in

**Value**: `production`

**Add to Vercel**:
```
Key: NODE_ENV
Value: production
```

---

## Optional Environment Variables

### 4. GEMINI_API_KEY (Optional)
**Purpose**: Only needed if you're using Google Gemini AI features

**How to get it**:
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key

**Add to Vercel**:
```
Key: GEMINI_API_KEY
Value: AIzaSy...your-key-here
```

**Note**: Skip this if you're not using AI features

---

### 5. APP_URL (Optional)
**Purpose**: Alternative base URL variable (some code might reference this)

**Value**: Same as NEXTAUTH_URL

**Add to Vercel**:
```
Key: APP_URL
Value: https://your-app.vercel.app
```

---

## Firebase Configuration

✅ **Already configured** - No action needed!

Your Firebase credentials are in `firebase-applet-config.json`:
```json
{
  "projectId": "xanthic-basis-9cf5x",
  "appId": "1:1072694544490:web:b67b85cd4a2baf548ea213",
  "apiKey": "AIzaSyCUbWIn7fafNT4PKHTlDcjUQXPd-h5Z6Ks",
  "firestoreDatabaseId": "ai-studio-labpulse-7445edf1-4a8c-44a2-a1ee-efd3531ed616"
}
```

This file is automatically loaded by your app. No environment variables needed for Firebase!

---

## How to Add Variables to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (e.g., "Lab-pulse")
3. **Click Settings** (top navigation)
4. **Click Environment Variables** (left sidebar)
5. **For each variable**:
   - Enter the **Name** (e.g., `NEXTAUTH_SECRET`)
   - Enter the **Value**
   - Select **All** environments (Production, Preview, Development)
   - Click **Save**

6. **Redeploy**:
   - Go to **Deployments** tab
   - Click **•••** menu on latest deployment
   - Click **Redeploy**

---

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Add environment variables
vercel env add NEXTAUTH_SECRET production
# Paste your secret when prompted

vercel env add NEXTAUTH_URL production
# Enter: https://your-app.vercel.app

vercel env add NODE_ENV production
# Enter: production

# Redeploy
vercel --prod
```

---

## Summary - Copy & Paste This

### Minimum Required Variables (Copy these to Vercel):

```
NEXTAUTH_SECRET=your-generated-32-char-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
NODE_ENV=production
```

### With Optional Variables:

```
NEXTAUTH_SECRET=your-generated-32-char-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
NODE_ENV=production
GEMINI_API_KEY=your-gemini-key-if-needed
APP_URL=https://your-app.vercel.app
```

---

## Testing After Setup

After adding environment variables and redeploying:

### 1. Test Health Endpoint
```bash
curl https://your-app.vercel.app/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "service": "Lab Pulse API",
  "timestamp": "2026-07-31T..."
}
```

### 2. Test Login
```bash
curl -X POST https://your-app.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@labpulse.org","password":"password123"}'
```

**Expected Response**:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "user-admin",
    "name": "Priya Sharma (Program Mgr)",
    "email": "admin@labpulse.org",
    "role": "admin"
  }
}
```

### 3. Test Schools Data
```bash
curl https://your-app.vercel.app/api/schools
```

**Expected Response**:
```json
{
  "summaries": [...],
  "alerts": [...]
}
```

---

## Troubleshooting

### "Invalid or expired token"
- Check that `NEXTAUTH_SECRET` is set correctly
- Make sure it's the same secret used to generate the token

### "500 Internal Server Error"
1. Check Vercel function logs:
   - Dashboard → Deployments → Latest → Functions → /api/index → Logs
2. Look for the actual error message
3. Common issues:
   - Missing `NEXTAUTH_SECRET`
   - Firebase connection issues
   - Syntax errors in code

### "CORS errors"
- Already fixed in the code (allows all origins)
- If still seeing issues, check browser console for specific error

### "Cannot find module"
- Check that all imports are correct
- Ensure `firebase` package is in `dependencies` (not `devDependencies`)
- Run `npm install` locally to verify

---

## Security Notes

⚠️ **IMPORTANT**:

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use different secrets** for development and production
3. **Rotate secrets** if they're ever exposed
4. **Use strong, random secrets** - Don't use predictable strings
5. **Restrict Firebase rules** in production (currently open for demo)

---

## Quick Checklist

- [ ] Generated secure NEXTAUTH_SECRET (32+ chars)
- [ ] Added NEXTAUTH_SECRET to Vercel
- [ ] Added NEXTAUTH_URL with your Vercel domain
- [ ] Added NODE_ENV=production
- [ ] (Optional) Added GEMINI_API_KEY if using AI
- [ ] Redeployed application
- [ ] Tested /api/health endpoint
- [ ] Tested /api/schools endpoint
- [ ] Tested login functionality

---

## Need Help?

If deployment still fails after following this guide:

1. **Check Vercel Logs**: Dashboard → Functions → /api/index → View Logs
2. **Look for specific error**: The logs will show the exact issue
3. **Common fixes**:
   - Redeploy after adding env variables
   - Clear build cache: Settings → General → Clear Build Cache
   - Check Firebase console for connection issues

---

**Last Updated**: July 31, 2026
