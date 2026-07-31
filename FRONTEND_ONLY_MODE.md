# Frontend-Only Mode - Lab Pulse

## What Changed

The app now runs in **frontend-only mode** using mock data instead of backend API calls. This allows the app to work on Vercel without needing a functioning backend API.

## Files Created

1. **`src/lib/mockData.ts`** - Contains all dummy data (schools, users, entries, experiments)
2. **`src/lib/api.ts`** - API wrapper that switches between mock and real API calls

## How It Works

- Set `USE_MOCK_DATA = true` in `src/lib/api.ts` (already set)
- All API calls now use local mock data instead of hitting `/api/*` endpoints
- Data includes:
  - 3 schools (Oakridge, Sunrise, Horizon)
  - 4 users (1 admin, 3 teachers)
  - 14 days of entry data
  - Health scores and alerts calculated from mock data

## Features Working

✅ Login (any email/password works with mock users)
✅ Dashboard with school health summaries
✅ School drilldown view
✅ Create new entries (saved to in-memory array)
✅ Recent entries display
✅ User management view
✅ Weekly reports
✅ All visualizations and charts

## Demo Users

```
Admin:
- email: admin@labpulse.org
- password: password123

Teachers:
- oakridge.lab@school.edu / password123
- sunrise.lab@school.edu / password123
- horizon.lab@school.edu / password123
```

## Deployment

Just deploy to Vercel as-is:

```bash
git add .
git commit -m "Switch to frontend-only mode with mock data"
git push
```

No environment variables needed!

## Switching Back to Real API

If you want to use the real backend later:

1. Open `src/lib/api.ts`
2. Change `USE_MOCK_DATA = false`
3. Set up environment variables in Vercel
4. Redeploy

## Limitations

- Data resets on page reload (no persistence)
- Creating new schools/users not fully implemented in mock mode
- Password reset not available in mock mode

## Benefits

✅ Works immediately on Vercel
✅ No backend errors
✅ Fast and responsive
✅ Perfect for demo/prototype
✅ No database setup needed
✅ No environment variables needed
