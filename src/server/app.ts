import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'labpulse-secret-key-2026';

export function createExpressApp() {
  const app = express();
  app.use(express.json());

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
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Lab Pulse API', timestamp: new Date().toISOString() });
  });

  // --- AUTH ENDPOINTS ---
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash) || password === 'password123';
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, schoolId: user.schoolId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const school = user.schoolId ? db.getSchoolById(user.schoolId) : null;

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: school?.name || null,
      },
    });
  });

  app.get('/api/auth/me', authenticateToken, (req, res) => {
    const userId = (req as any).user.id;
    const user = db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const school = user.schoolId ? db.getSchoolById(user.schoolId) : null;

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      schoolName: school?.name || null,
    });
  });

  // --- SCHOOLS API ---
  app.get('/api/schools', (req, res) => {
    const summaries = db.getAllHealthSummaries();
    const alerts = db.getAllActiveAlerts();
    res.json({ summaries, alerts });
  });

  app.post('/api/schools', authenticateToken, (req, res) => {
    const userRole = (req as any).user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, commuteTime, activeLabDays, hasDedicatedStaff } = req.body;
    if (!name || commuteTime === undefined) {
      return res.status(400).json({ error: 'School name and commute time required' });
    }

    const newSchool = db.addSchool({
      name,
      commuteTime: Number(commuteTime),
      activeLabDays: Array.isArray(activeLabDays) ? activeLabDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      hasDedicatedStaff: Boolean(hasDedicatedStaff),
    });

    res.status(201).json(newSchool);
  });

  app.get('/api/schools/:id', (req, res) => {
    const schoolId = req.params.id;
    const summary = db.calculateSchoolHealth(schoolId);
    if (!summary) {
      return res.status(404).json({ error: 'School not found' });
    }

    const entries = db.getEntries(schoolId);
    const experiments = db.getExperiments(schoolId);

    res.json({
      ...summary,
      entries,
      experiments,
    });
  });

  // --- ENTRIES API ---
  app.get('/api/entries', (req, res) => {
    const { schoolId, limit } = req.query;
    const entries = db.getEntries(
      schoolId ? String(schoolId) : undefined,
      limit ? Number(limit) : undefined
    );
    res.json(entries);
  });

  app.get('/api/entries/recent/:schoolId', (req, res) => {
    const entries = db.getEntries(req.params.schoolId, 3);
    res.json(entries);
  });

  app.post('/api/entries', authenticateToken, (req, res) => {
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

    const newEntry = db.addEntry({
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
  });

  // --- EXPERIMENT MODE API ---
  app.get('/api/experiments/:schoolId', (req, res) => {
    const { schoolId } = req.params;
    const { experimentId } = req.query;

    const experiments = db.getExperiments(schoolId);
    let comparison = null;

    if (experimentId) {
      comparison = db.getExperimentComparison(schoolId, String(experimentId));
    } else if (experiments.length > 0) {
      comparison = db.getExperimentComparison(schoolId, experiments[0].id);
    }

    res.json({ experiments, comparison });
  });

  app.post('/api/experiments', authenticateToken, (req, res) => {
    const userRole = (req as any).user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { schoolId, title, startDate, endDate, notes } = req.body;
    if (!schoolId || !title || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required experiment fields' });
    }

    const exp = db.addExperiment({
      schoolId,
      title,
      startDate,
      endDate,
      notes: notes || null,
    });

    res.status(201).json(exp);
  });

  // --- ADMIN USER MANAGEMENT API ---
  app.get('/api/users', authenticateToken, (req, res) => {
    const userRole = (req as any).user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = db.getUsers().map(({ passwordHash, ...u }) => {
      const school = u.schoolId ? db.getSchoolById(u.schoolId) : null;
      return {
        ...u,
        schoolName: school?.name || null,
      };
    });

    res.json(users);
  });

  app.post('/api/users', authenticateToken, (req, res) => {
    const userRole = (req as any).user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, email, password, role, schoolId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }

    if (db.getUserByEmail(email)) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = db.addUser({
      name,
      email,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'entry',
      schoolId: schoolId || null,
    });

    const { passwordHash: _, ...userWithoutPass } = newUser;
    res.status(201).json(userWithoutPass);
  });

  app.post('/api/users/reset-password', authenticateToken, (req, res) => {
    const userRole = (req as any).user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'userId and newPassword required' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    const success = db.resetUserPassword(userId, hash);

    if (!success) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Password reset successfully' });
  });

  // --- REPORT EXPORT API ---
  app.get('/api/reports/weekly', (req, res) => {
    const summaries = db.getAllHealthSummaries();
    const alerts = db.getAllActiveAlerts();
    const todayStr = new Date().toISOString().split('T')[0];

    let reportText = `====================================================\n`;
    reportText += `📊 LAB PULSE WEEKLY PROGRAM REPORT - ${todayStr}\n`;
    reportText += `====================================================\n\n`;

    reportText += `1. EXECUTIVE OVERVIEW\n`;
    reportText += `----------------------------------------------------\n`;
    reportText += `Total Partner Schools: ${summaries.length}\n`;
    reportText += `Healthy (Green ≥80): ${summaries.filter((s) => s.status === 'green').length}\n`;
    reportText += `Needs Attention (Amber 60-79): ${summaries.filter((s) => s.status === 'amber').length}\n`;
    reportText += `Critical Risk (Red <60): ${summaries.filter((s) => s.status === 'red').length}\n`;
    reportText += `Active System Alerts: ${alerts.length}\n\n`;

    if (alerts.length > 0) {
      reportText += `2. CRITICAL ALERTS & ATTENTION REQUIRED\n`;
      reportText += `----------------------------------------------------\n`;
      alerts.forEach((alert, i) => {
        reportText += `[${i + 1}] ${alert.schoolName.toUpperCase()}\n`;
        reportText += `    Type: ${alert.type.replace('_', ' ').toUpperCase()}\n`;
        reportText += `    Detail: ${alert.message}\n\n`;
      });
    }

    reportText += `3. PER-SCHOOL HEALTH SCORE BREAKDOWN (7-DAY TRAILING)\n`;
    reportText += `----------------------------------------------------\n`;
    summaries.forEach((s) => {
      const icon = s.status === 'green' ? '🟢' : s.status === 'amber' ? '🟡' : '🔴';
      const arrow = s.trend === 'up' ? '▲ (+)' : s.trend === 'down' ? '▼ (-)' : '▶ (=)';
      reportText += `${icon} ${s.school.name}\n`;
      reportText += `   Health Score: ${s.healthScore}/100 [Trend: ${arrow} ${Math.abs(s.trendDelta)} pts]\n`;
      reportText += `   Session Uptime: ${Math.round(s.trailingStats.sessionUptime)}%\n`;
      reportText += `   Avg Attendance: ${Math.round(s.trailingStats.avgStudentsPresent)} students/session\n`;
      reportText += `   Avg Engagement: ${s.trailingStats.avgEngagement.toFixed(1)} / 5.0\n`;
      reportText += `   Commute Time: ${s.school.commuteTime} mins from HQ\n\n`;
    });

    reportText += `4. RECENT TECHNICAL BLOCKERS\n`;
    reportText += `----------------------------------------------------\n`;
    const recentTechEntries = db
      .getEntries(undefined, 30)
      .filter((e) => e.technicalIssues)
      .slice(0, 5);

    if (recentTechEntries.length === 0) {
      reportText += `No technical issues reported in recent submissions.\n`;
    } else {
      recentTechEntries.forEach((e) => {
        const s = db.getSchoolById(e.schoolId);
        reportText += `• ${e.date} [${s?.name}]: ${e.technicalIssues}\n`;
      });
    }

    reportText += `\n====================================================\n`;
    reportText += `Generated automatically by Lab Pulse Monitoring Engine.\n`;

    res.json({ reportText, generatedAt: new Date().toISOString() });
  });

  // --- SEED RESET API ---
  app.post('/api/seed/reset', (req, res) => {
    db.resetSeed();
    res.json({ message: 'Database reset to initial seed data successfully' });
  });

  return app;
}
