import { createExpressApp } from '../src/server/app';

let app: any;
try {
  app = createExpressApp();
} catch (err) {
  console.error('Express app creation error:', err);
}

export default function handler(req: any, res: any) {
  // CORS permissions for all sites
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!app) {
      app = createExpressApp();
    }
    return app(req, res);
  } catch (err: any) {
    console.error('Serverless Handler Error:', err);
    return res.status(200).json({
      error: 'API fallback',
      message: err?.message || String(err)
    });
  }
}
