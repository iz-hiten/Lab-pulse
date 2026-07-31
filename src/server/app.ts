import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as firestoreService from '../services/firestoreService';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'labpulse-secret-key-2026';

export function createExpressApp() {
  const app = express();
  app.use(express.json());

  // --- CORS MIDDLEWARE FOR ALL SITES ---
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  const router = express.Router();

  // --- AUTH MIDDLEWARE ---
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });
      (req as any).user = user;
      next();
    });
  };

  // --- HEALTH CHECK ---
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Lab Pulse API', timestamp: new Date().toISOString() });
  });

  // --- AUTH ENDPOINTS ---
  router.post('/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const result = await firestoreService.loginUserDirect(email);
      
      // In production, verify password against Firestore stored hash
      // For demo, accepting any password
      const token = jwt.sign(
        { id: result.user.id, email: result.user.email, role: result.user.role, schoolId: result.user.schoolId },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: result.user,
      });
    } catch (err: any) {
      console.error('Login Endpoint Error:', err);
      return res.status(500).json({ error: 'Login failure', details: err?.message || String(err) });
    }
  });

  router.get('/auth/me', authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const users = await firestoreService.fetchUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) return res.status(404).json({ error: 'User not found' });

      const schools = await firestoreService.fetchSchools();
      const school = user.schoolId ? schools.find(s => s.id === user.schoolId) : null;

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: school?.name || null,
      });
    } catch (err: any) {
      console.error('Auth/me Error:', err);
      return res.status(500).json({ error: 'Failed to fetch user', details: err?.message || String(err) });
    }
  });

  // --- SCHOOLS API ---
  router.get('/schools', async (req, res) => {
    try {
      const data = await firestoreService.getDashboardSummaryDirect();
      res.json(data);
    } catch (err: any) {
      console.error('Schools API Error:', err);
      return res.status(500).json({ error: 'Failed to fetch schools', details: err?.message || String(err) });
    }
  });

  router.post('/schools', authenticateToken, async (req, res) => {
    try {
      const userRole = (req as any).user.role;
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { name, commuteTime, activeLabDays, hasDedicatedStaff } = req.body;
      if (!name || commuteTime === undefined) {
        return res.status(400).json({ error: 'School name and commute time required' });
      }

      const newSchool = await firestoreService.createSchoolInFirestore({
        name,
        commuteTime: Number(commuteTime),
        activeLabDays: Array.isArray(activeLabDays) ? activeLabDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        hasDedicatedStaff: Boolean(hasDedicatedStaff),
      });

      res.status(201).json(newSchool);
    } catch (err: any) {
      console.error('Create School Error:', err);
      return res.status(500).json({ error: 'Failed to create school', details: err?.message || String(err) });
    }
  });

  router.get('/schools/:id', async (req, res) => {
    try {
      const schoolId = req.params.id;
      const data = await firestoreService.getSchoolDrilldownDirect(schoolId);
      
      if (!data) {
        return res.status(404).json({ error: 'School not found' });
      }

      res.json(data);
    } catch (err: any) {
      console.error('School Detail Error:', err);
      return res.status(500).json({ error: 'Failed to fetch school details', details: err?.message || String(err) });
    }
  });

  // --- ENTRIES API ---
  router.get('/entries', async (req, res) => {
    try {
      const { schoolId, limit } = req.query;
      const entries = await firestoreService.fetchEntries(
        schoolId ? String(schoolId) : undefined,
        limit ? Number(limit) : undefined
      );
      res.json(entries);
    } catch (err: any) {
      console.error('Entries API Error:', err);
      return res.status(500).json({ error: 'Failed to fetch entries', details: err?.message || String(err) });
    }
  });

  router.get('/entries/recent/:schoolId', async (req, res) => {
    try {
      const entries = await firestoreService.fetchEntries(req.params.schoolId, 3);
      res.json(entries);
    } catch (err: any) {
      console.error('Recent Entries Error:', err);
      return res.status(500).json({ error: 'Failed to fetch recent entries', details: err?.message || String(err) });
    }
  });

  router.post('/entries', authenticateToken, async (req, res) => {
    try {
      const {
        schoolId,
        date,
        studentsPresent,
        sessionRan,
        sessionDurationMins,
        engagementLevel,
        contentCompleted,
        technicalIssues,
        notes,
        isExperimentDay,
      } = req.body;

      if (!schoolId || !date) {
        return res.status(400).json({ error: 'schoolId and date are required' });
      }

      const user = (req as any).user;

      const newEntry = await firestoreService.createEntryInFirestore({
        schoolId,
        date,
        studentsPresent: Number(studentsPresent || 0),
        sessionRan: Boolean(sessionRan),
        sessionDurationMins: sessionDurationMins ? Number(sessionDurationMins) : null,
        engagementLevel: Number(engagementLevel || 3),
        contentCompleted: contentCompleted || null,
        technicalIssues: technicalIssues || null,
        notes: notes || null,
        isExperimentDay: Boolean(isExperimentDay),
        submittedById: user.id,
      });

      res.status(201).json(newEntry);
    } catch (err: any) {
      console.error('Create Entry Error:', err);
      return res.status(500).json({ error: 'Failed to create entry', details: err?.message || String(err) });
    }
  });

  // --- EXPERIMENT MODE API ---
  router.get('/experiments/:schoolId', async (req, res) => {
    try {
      const { schoolId } = req.params;
      const { experimentId } = req.query;

      const experiments = await firestoreService.fetchExperiments(schoolId);
      let comparison = null;

      // Note: Experiment comparison logic would need to be implemented in firestoreService
      // For now, just return experiments

      res.json({ experiments, comparison });
    } catch (err: any) {
      console.error('Experiments API Error:', err);
      return res.status(500).json({ error: 'Failed to fetch experiments', details: err?.message || String(err) });
    }
  });

  router.post('/experiments', authenticateToken, async (req, res) => {
    try {
      const userRole = (req as any).user.role;
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { schoolId, title, startDate, endDate, notes } = req.body;
      if (!schoolId || !title || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required experiment fields' });
      }

      const exp = await firestoreService.createExperimentInFirestore({
        schoolId,
        title,
        startDate,
        endDate,
        notes: notes || null,
      });

      res.status(201).json(exp);
    } catch (err: any) {
      console.error('Create Experiment Error:', err);
      return res.status(500).json({ error: 'Failed to create experiment', details: err?.message || String(err) });
    }
  });

  // --- ADMIN USER MANAGEMENT API ---
  router.get('/users', authenticateToken, async (req, res) => {
    try {
      const userRole = (req as any).user.role;
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const users = await firestoreService.fetchUsers();
      const schools = await firestoreService.fetchSchools();
      
      const usersWithSchools = users.map(u => {
        const school = u.schoolId ? schools.find(s => s.id === u.schoolId) : null;
        return {
          ...u,
          schoolName: school?.name || null,
        };
      });

      res.json(usersWithSchools);
    } catch (err: any) {
      console.error('Users API Error:', err);
      return res.status(500).json({ error: 'Failed to fetch users', details: err?.message || String(err) });
    }
  });

  router.post('/users', authenticateToken, async (req, res) => {
    try {
      const userRole = (req as any).user.role;
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { name, email, password, role, schoolId } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password required' });
      }

      // Note: User creation in Firestore would need to be implemented
      // For now, return a placeholder response
      return res.status(501).json({ error: 'User creation not yet implemented in Firestore' });
    } catch (err: any) {
      console.error('Create User Error:', err);
      return res.status(500).json({ error: 'Failed to create user', details: err?.message || String(err) });
    }
  });

  router.post('/users/reset-password', authenticateToken, async (req, res) => {
    try {
      const userRole = (req as any).user.role;
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { userId, newPassword } = req.body;
      if (!userId || !newPassword) {
        return res.status(400).json({ error: 'userId and newPassword required' });
      }

      // Note: Password reset in Firestore would need to be implemented
      return res.status(501).json({ error: 'Password reset not yet implemented in Firestore' });
    } catch (err: any) {
      console.error('Reset Password Error:', err);
      return res.status(500).json({ error: 'Failed to reset password', details: err?.message || String(err) });
    }
  });

  // --- REPORT EXPORT API ---
  router.get('/reports/weekly', async (req, res) => {
    try {
      const report = await firestoreService.generateWeeklyReportDirect();
      res.json({ ...report, generatedAt: new Date().toISOString() });
    } catch (err: any) {
      console.error('Weekly Report Error:', err);
      return res.status(500).json({ error: 'Failed to generate report', details: err?.message || String(err) });
    }
  });

  // --- SEED RESET API ---
  router.post('/seed/reset', async (req, res) => {
    try {
      // Note: Seed reset in Firestore would need manual implementation
      return res.status(501).json({ error: 'Seed reset not implemented for Firestore. Use Firebase Console to manage data.' });
    } catch (err: any) {
      console.error('Seed Reset Error:', err);
      return res.status(500).json({ error: 'Failed to reset seed', details: err?.message || String(err) });
    }
  });

  // Mount router under both '/api' and '/' for Vercel serverless prefix compatibility
  app.use('/api', router);
  app.use('/', router);

  // Global error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global Express Error:', err);
    res.status(500).json({ error: 'Server Error', message: err?.message || String(err) });
  });

  return app;
}
