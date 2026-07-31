# 🚀 Lab Pulse Deployment Checklist

## Pre-Deployment

- [ ] All code changes committed
- [ ] `.env` file NOT committed (check `.gitignore`)
- [ ] Firebase configuration in `firebase-applet-config.json` is correct

## Vercel Environment Variables

### Required Variables (Must Have)
- [ ] `NEXTAUTH_SECRET` - Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] `NEXTAUTH_URL` - Your Vercel URL (e.g., `https://lab-pulse.vercel.app`)
- [ ] `NODE_ENV` - Set to `production`

### Optional Variables
- [ ] `GEMINI_API_KEY` - Only if using AI features
- [ ] `APP_URL` - Can be same as NEXTAUTH_URL

## Deployment Steps

1. **Generate NEXTAUTH_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output ✅

2. **Add to Vercel**:
   - Go to: https://vercel.com/dashboard
   - Select your project → Settings → Environment Variables
   - Add each variable above
   - Select "All" environments
   - Click Save

3. **Commit & Push**:
```bash
git add .
git commit -m "Fix: Migrate from in-memory DB to Firebase Firestore"
git push
```

4. **Vercel Auto-Deploys** or manually trigger:
   - Dashboard → Deployments → Redeploy

## Testing

### 1. Health Check ✅
```bash
curl https://your-app.vercel.app/api/health
```
Expected: `{"status":"ok","service":"Lab Pulse API",...}`

### 2. Schools Data ✅
```bash
curl https://your-app.vercel.app/api/schools
```
Expected: JSON with `summaries` and `alerts`

### 3. Login ✅
```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@labpulse.org","password":"password123"}'
```
Expected: JSON with `token` and `user`

### 4. Browse App ✅
Open: `https://your-app.vercel.app`

## Troubleshooting

If you get 500 errors:

1. **Check Vercel Logs**:
   - Dashboard → Deployments → Latest → Functions → `/api/index` → View Logs

2. **Common Issues**:
   - ❌ Missing `NEXTAUTH_SECRET` → Add it in Vercel settings
   - ❌ Wrong `NEXTAUTH_URL` → Update to match your domain
   - ❌ Firebase connection → Check `firebase-applet-config.json`
   - ❌ Build errors → Check build logs

3. **Quick Fixes**:
   ```bash
   # Clear build cache
   # Go to: Settings → General → Clear Build Cache → Redeploy
   
   # Or redeploy from CLI
   vercel --prod --force
   ```

## Post-Deployment

- [ ] Health endpoint responds
- [ ] Can login as admin: `admin@labpulse.org` / `password123`
- [ ] Dashboard loads with school data
- [ ] Can create entries
- [ ] Weekly reports generate
- [ ] Firebase data persists across deploys

## What Changed

✅ **Fixed Issues**:
1. Changed from in-memory DB to Firebase Firestore
2. Updated `src/server/app.ts` to use Firebase services
3. All data now persists in Firebase
4. Added proper error handling
5. Configured Vercel function settings

✅ **No More**:
- File system operations
- Data loss on cold starts
- Memory-only storage

## Firebase Console

Monitor your data:
- Console: https://console.firebase.google.com
- Project: `xanthic-basis-9cf5x`
- Database: `ai-studio-labpulse-7445edf1-4a8c-44a2-a1ee-efd3531ed616`

Collections:
- `schools` - Partner schools
- `users` - App users
- `entries` - Daily entries
- `experiments` - A/B test windows

## Security Notes

⚠️ **Before Going Live**:
1. Change `NEXTAUTH_SECRET` to a secure random value
2. Update default passwords for all users
3. Configure Firebase Security Rules (currently open)
4. Consider restricting CORS to your domain only
5. Enable Firebase Authentication (optional)

## Support Files

- 📄 `VERCEL_ENV_SETUP.md` - Detailed environment variable guide
- 📄 `DEPLOYMENT.md` - Full deployment documentation
- 📄 `.env.example` - Environment variable template

---

**Status**: Ready to Deploy ✅
**Last Updated**: July 31, 2026
