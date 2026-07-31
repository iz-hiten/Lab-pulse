import { createExpressApp } from '../src/server/app';

const app = createExpressApp();

export default function handler(req: any, res: any) {
  // CORS permissions for all sites
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return app(req, res);
}
