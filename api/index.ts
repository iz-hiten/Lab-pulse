import { createExpressApp } from '../src/server/app';

let app: any;

export default function handler(req: any, res: any) {
  // CORS permissions for all sites
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Lazy initialize the Express app
    if (!app) {
      console.log('Initializing Express app for serverless...');
      app = createExpressApp();
      console.log('Express app initialized successfully');
    }
    
    return app(req, res);
  } catch (err: any) {
    console.error('Serverless Handler Error:', err);
    console.error('Error stack:', err?.stack);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err?.message || String(err),
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined
    });
  }
}
