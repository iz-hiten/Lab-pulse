import fs from 'fs';
import path from 'path';
import os from 'os';
import bcrypt from 'bcryptjs';

export interface SchoolData {
  id: string;
  name: string;
  commuteTime: number; // in minutes
  activeLabDays: string[]; // ["Mon", "Tue", ...]
  hasDedicatedStaff: boolean;
  createdAt: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'entry' | 'admin';
  schoolId: string | null;
  createdAt: string;
}

export interface DailyEntryData {
  id: string;
  schoolId: string;
  date: string; // YYYY-MM-DD
  studentsPresent: number;
  sessionRan: boolean;
  sessionDurationMins: number | null;
  engagementLevel: number; // 1-5
  contentCompleted: string | null;
  technicalIssues: string | null;
  notes: string | null;
  isExperimentDay: boolean;
  submittedById: string;
  createdAt: string;
}

export interface ExperimentWindowData {
  id: string;
  schoolId: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  notes: string | null;
  createdAt: string;
}

export interface AlertItem {
  id: string;
  schoolId: string;
  schoolName: string;
  type: 'missed_sessions' | 'attendance_drop' | 'recurring_technical_issue';
  severity: 'high' | 'medium';
  message: string;
}

export interface SchoolHealthSummary {
  school: SchoolData;
  healthScore: number; // 0-100
  status: 'green' | 'amber' | 'red';
  trend: 'up' | 'down' | 'flat';
  trendDelta: number; // difference in score vs prior 7d
  trailingStats: {
    attendanceRate: number; // percentage vs expected/capacity
    avgStudentsPresent: number;
    sessionUptime: number; // percentage of active lab days session ran
    avgEngagement: number; // 1.0 - 5.0
    totalEntries: number;
    missedSessions: number;
    techIssueCount: number;
  };
  alerts: AlertItem[];
}

const DATA_DIR = path.join(os.tmpdir(), 'labpulse_data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface SchemaDB {
  schools: SchoolData[];
  users: UserData[];
  entries: DailyEntryData[];
  experiments: ExperimentWindowData[];
}

function getInitialSeedData(): SchemaDB {
  const passwordHash = bcrypt.hashSync('password123', 10);
  
  const schools: SchoolData[] = [
    {
      id: 'school-oakridge',
      name: 'Oakridge Community High School',
      commuteTime: 45,
      activeLabDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      hasDedicatedStaff: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'school-sunrise',
      name: 'Sunrise Valley Academy',
      commuteTime: 90,
      activeLabDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      hasDedicatedStaff: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'school-horizon',
      name: 'Horizon STEM Technical Academy',
      commuteTime: 25,
      activeLabDays: ['Mon', 'Tue', 'Wed', 'Thu'],
      hasDedicatedStaff: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const users: UserData[] = [
    {
      id: 'user-admin',
      name: 'Priya Sharma (Program Mgr)',
      email: 'admin@labpulse.org',
      passwordHash,
      role: 'admin',
      schoolId: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-oakridge',
      name: 'Marcus Vance',
      email: 'oakridge.lab@school.edu',
      passwordHash,
      role: 'entry',
      schoolId: 'school-oakridge',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-sunrise',
      name: 'Amina Nkosi',
      email: 'sunrise.lab@school.edu',
      passwordHash,
      role: 'entry',
      schoolId: 'school-sunrise',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-horizon',
      name: 'David Chen',
      email: 'horizon.lab@school.edu',
      passwordHash,
      role: 'entry',
      schoolId: 'school-horizon',
      createdAt: new Date().toISOString(),
    },
  ];

  const experiments: ExperimentWindowData[] = [
    {
      id: 'exp-oakridge-gamified',
      schoolId: 'school-oakridge',
      title: 'Gamified Science Modules (v2.1)',
      startDate: getDateOffset(-7),
      endDate: getDateOffset(-1),
      notes: 'Testing interactive badge rewards for speed and accuracy.',
      createdAt: new Date().toISOString(),
    },
  ];

  const entries: DailyEntryData[] = [];

  // Seed 14 days of entries
  for (let offset = 14; offset >= 0; offset--) {
    const dateStr = getDateOffset(-offset);
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

    // Oakridge (Healthy, high engagement)
    const oakExp = offset >= 1 && offset <= 7;
    entries.push({
      id: `entry-oak-${offset}`,
      schoolId: 'school-oakridge',
      date: dateStr,
      studentsPresent: 28 + (offset % 3) - 1,
      sessionRan: true,
      sessionDurationMins: 45,
      engagementLevel: oakExp ? 5 : 4,
      contentCompleted: `Module ${15 - offset}: Interactive Physics & Logic Gates`,
      technicalIssues: offset === 4 ? 'Slow Wi-Fi connection during video clip' : null,
      notes: 'Active participation. Students enjoyed pair programming.',
      isExperimentDay: oakExp,
      submittedById: 'user-oakridge',
      createdAt: new Date().toISOString(),
    });

    // Sunrise (Struggling: missed sessions, lower attendance, solar inverter tech issue)
    const sunriseRan = offset !== 1 && offset !== 2 && offset !== 5; // 3 missed sessions in trailing 14d
    const sunriseTech = sunriseRan && (offset % 2 === 0);
    entries.push({
      id: `entry-sun-${offset}`,
      schoolId: 'school-sunrise',
      date: dateStr,
      studentsPresent: sunriseRan ? 14 + (offset % 4) : 0,
      sessionRan: sunriseRan,
      sessionDurationMins: sunriseRan ? 40 : null,
      engagementLevel: sunriseRan ? (offset < 7 ? 2 : 3) : 1,
      contentCompleted: sunriseRan ? `Module ${15 - offset}: Basic Math Scratch Pad` : null,
      technicalIssues: !sunriseRan ? 'Solar inverter tripped - lab shut down at 1:30 PM' : (sunriseTech ? 'Solar inverter warning - voltage drop' : null),
      notes: !sunriseRan ? 'Session cancelled due to power blackout.' : 'Solar power unstable in late afternoon.',
      isExperimentDay: false,
      submittedById: 'user-sunrise',
      createdAt: new Date().toISOString(),
    });

    // Horizon (Good, consistent)
    if (dayOfWeek !== 5) { // Horizon active Mon-Thu
      entries.push({
        id: `entry-hor-${offset}`,
        schoolId: 'school-horizon',
        date: dateStr,
        studentsPresent: 25 + (offset % 2),
        sessionRan: true,
        sessionDurationMins: 50,
        engagementLevel: 4,
        contentCompleted: `Module ${15 - offset}: STEM Robotics & Circuits`,
        technicalIssues: offset === 8 ? 'Projector lamp flickered' : null,
        notes: 'Great energy today. All groups finished the exercise.',
        isExperimentDay: false,
        submittedById: 'user-horizon',
        createdAt: new Date().toISOString(),
      });
    }
  }

  return { schools, users, entries, experiments };
}

function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

class LocalDB {
  private data: SchemaDB;

  constructor() {
    this.data = this.load();
  }

  private load(): SchemaDB {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('DB file load notice (using memory seed):', err);
    }
    const initial = getInitialSeedData();
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: SchemaDB): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2));
    } catch (err) {
      // In read-only or serverless environments, ignore file write errors
    }
  }

  public resetSeed(): SchemaDB {
    this.data = getInitialSeedData();
    this.save();
    return this.data;
  }

  // --- SCHOOLS ---
  public getSchools(): SchoolData[] {
    return this.data.schools;
  }

  public getSchoolById(id: string): SchoolData | undefined {
    return this.data.schools.find((s) => s.id === id);
  }

  public addSchool(school: Omit<SchoolData, 'id' | 'createdAt'>): SchoolData {
    const newSchool: SchoolData = {
      ...school,
      id: `school-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.schools.push(newSchool);
    this.save();
    return newSchool;
  }

  // --- USERS ---
  public getUsers(): UserData[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): UserData | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): UserData | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public addUser(user: Omit<UserData, 'id' | 'createdAt'>): UserData {
    const newUser: UserData = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public resetUserPassword(userId: string, newPasswordHash: string): boolean {
    const u = this.data.users.find((usr) => usr.id === userId);
    if (u) {
      u.passwordHash = newPasswordHash;
      this.save();
      return true;
    }
    return false;
  }

  // --- DAILY ENTRIES ---
  public getEntries(schoolId?: string, limit?: number): DailyEntryData[] {
    let list = [...this.data.entries];
    if (schoolId) {
      list = list.filter((e) => e.schoolId === schoolId);
    }
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (limit) {
      list = list.slice(0, limit);
    }
    return list;
  }

  public addEntry(entry: Omit<DailyEntryData, 'id' | 'createdAt'>): DailyEntryData {
    const newEntry: DailyEntryData = {
      ...entry,
      id: `entry-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    // Upsert if entry for same school and date exists
    const existingIdx = this.data.entries.findIndex(
      (e) => e.schoolId === entry.schoolId && e.date === entry.date
    );
    if (existingIdx >= 0) {
      this.data.entries[existingIdx] = newEntry;
    } else {
      this.data.entries.push(newEntry);
    }
    this.save();
    return newEntry;
  }

  // --- EXPERIMENT WINDOWS ---
  public getExperiments(schoolId?: string): ExperimentWindowData[] {
    if (schoolId) {
      return this.data.experiments.filter((e) => e.schoolId === schoolId);
    }
    return this.data.experiments;
  }

  public addExperiment(exp: Omit<ExperimentWindowData, 'id' | 'createdAt'>): ExperimentWindowData {
    const newExp: ExperimentWindowData = {
      ...exp,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.experiments.push(newExp);
    this.save();
    return newExp;
  }

  // --- COMPUTED HEALTH & ALERTS ---
  public calculateSchoolHealth(schoolId: string): SchoolHealthSummary | null {
    const school = this.getSchoolById(schoolId);
    if (!school) return null;

    const allEntries = this.getEntries(schoolId);
    const today = new Date();

    // Trailing 7 days (including today)
    const trailing7 = allEntries.filter((e) => {
      const diffDays = (today.getTime() - new Date(e.date).getTime()) / (1000 * 3600 * 24);
      return diffDays >= -1 && diffDays <= 7;
    });

    // Prior 7 days (days 8 to 14)
    const prior7 = allEntries.filter((e) => {
      const diffDays = (today.getTime() - new Date(e.date).getTime()) / (1000 * 3600 * 24);
      return diffDays > 7 && diffDays <= 14;
    });

    const calculateStats = (entriesList: DailyEntryData[]) => {
      if (entriesList.length === 0) {
        return {
          sessionUptime: 100,
          avgEngagement: 4,
          attendanceRate: 85,
          avgStudentsPresent: 20,
          missedSessions: 0,
          techIssueCount: 0,
          totalEntries: 0,
        };
      }

      const ranCount = entriesList.filter((e) => e.sessionRan).length;
      const sessionUptime = (ranCount / entriesList.length) * 100;

      const ranEntries = entriesList.filter((e) => e.sessionRan);
      const avgEngagement = ranEntries.length
        ? ranEntries.reduce((acc, e) => acc + e.engagementLevel, 0) / ranEntries.length
        : 0;

      const totalStudents = ranEntries.reduce((acc, e) => acc + e.studentsPresent, 0);
      const avgStudentsPresent = ranEntries.length ? totalStudents / ranEntries.length : 0;

      // Estimate capacity as 30 students
      const attendanceRate = Math.min(100, (avgStudentsPresent / 30) * 100);

      const missedSessions = entriesList.filter((e) => !e.sessionRan).length;
      const techIssueCount = entriesList.filter((e) => Boolean(e.technicalIssues)).length;

      return {
        sessionUptime,
        avgEngagement,
        attendanceRate,
        avgStudentsPresent,
        missedSessions,
        techIssueCount,
        totalEntries: entriesList.length,
      };
    };

    const t7Stats = calculateStats(trailing7);
    const p7Stats = calculateStats(prior7);

    // Health Score calculation (Weighted: 40% Uptime + 30% Attendance + 30% Engagement Score out of 100)
    // Engagement scale 1-5 -> mapped to 0-100 (5 = 100%, 1 = 20%)
    const engagementScore = (t7Stats.avgEngagement / 5) * 100;
    const rawHealthScore = Math.round(
      t7Stats.sessionUptime * 0.4 + t7Stats.attendanceRate * 0.3 + engagementScore * 0.3
    );
    const healthScore = Math.min(100, Math.max(0, rawHealthScore));

    const p7EngagementScore = (p7Stats.avgEngagement / 5) * 100;
    const p7HealthScore = Math.round(
      p7Stats.sessionUptime * 0.4 + p7Stats.attendanceRate * 0.3 + p7EngagementScore * 0.3
    );

    const trendDelta = healthScore - p7HealthScore;
    let trend: 'up' | 'down' | 'flat' = 'flat';
    if (trendDelta >= 3) trend = 'up';
    else if (trendDelta <= -3) trend = 'down';

    let status: 'green' | 'amber' | 'red' = 'green';
    if (healthScore < 60) status = 'red';
    else if (healthScore < 80) status = 'amber';

    // Alerts calculation
    const alerts: AlertItem[] = [];

    // Alert 1: 2+ missed sessions in trailing week
    if (t7Stats.missedSessions >= 2) {
      alerts.push({
        id: `alert-missed-${schoolId}`,
        schoolId,
        schoolName: school.name,
        type: 'missed_sessions',
        severity: 'high',
        message: `${t7Stats.missedSessions} missed lab sessions recorded in the trailing 7 days.`,
      });
    }

    // Alert 2: Attendance dropped > 20% vs prior week
    if (p7Stats.avgStudentsPresent > 0) {
      const dropPct =
        ((p7Stats.avgStudentsPresent - t7Stats.avgStudentsPresent) / p7Stats.avgStudentsPresent) * 100;
      if (dropPct >= 20) {
        alerts.push({
          id: `alert-drop-${schoolId}`,
          schoolId,
          schoolName: school.name,
          type: 'attendance_drop',
          severity: 'high',
          message: `Attendance dropped by ${Math.round(dropPct)}% vs prior week (${Math.round(p7Stats.avgStudentsPresent)} → ${Math.round(t7Stats.avgStudentsPresent)} students).`,
        });
      }
    }

    // Alert 3: Technical issues reported 3+ days running
    // Check if latest 3 entries consecutively reported technical issues
    const sortedEntries = [...trailing7].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let consecutiveTech = 0;
    for (const entry of sortedEntries) {
      if (entry.technicalIssues) {
        consecutiveTech++;
      } else {
        break;
      }
    }
    if (consecutiveTech >= 3) {
      alerts.push({
        id: `alert-tech-${schoolId}`,
        schoolId,
        schoolName: school.name,
        type: 'recurring_technical_issue',
        severity: 'high',
        message: `Recurring technical issues reported for ${consecutiveTech} consecutive days: "${sortedEntries[0]?.technicalIssues || 'Equipment failure'}"`,
      });
    }

    return {
      school,
      healthScore,
      status,
      trend,
      trendDelta,
      trailingStats: t7Stats,
      alerts,
    };
  }

  public getAllHealthSummaries(): SchoolHealthSummary[] {
    return this.getSchools()
      .map((s) => this.calculateSchoolHealth(s.id))
      .filter((h): h is SchoolHealthSummary => h !== null);
  }

  public getAllActiveAlerts(): AlertItem[] {
    const summaries = this.getAllHealthSummaries();
    return summaries.flatMap((s) => s.alerts);
  }

  // Baseline vs Experiment comparison stats
  public getExperimentComparison(schoolId: string, experimentId: string) {
    const exp = this.data.experiments.find((e) => e.id === experimentId && e.schoolId === schoolId);
    if (!exp) return null;

    const entries = this.getEntries(schoolId);

    // Experiment entries
    const expEntries = entries.filter((e) => e.date >= exp.startDate && e.date <= exp.endDate);

    // Baseline entries: same length prior to experiment start date
    const expStart = new Date(exp.startDate);
    const expEnd = new Date(exp.endDate);
    const durationDays = Math.max(
      1,
      Math.round((expEnd.getTime() - expStart.getTime()) / (1000 * 3600 * 24)) + 1
    );

    const baseEnd = new Date(expStart);
    baseEnd.setDate(baseEnd.getDate() - 1);
    const baseStart = new Date(baseEnd);
    baseStart.setDate(baseStart.getDate() - durationDays + 1);

    const baseStartStr = baseStart.toISOString().split('T')[0];
    const baseEndStr = baseEnd.toISOString().split('T')[0];

    const baseEntries = entries.filter((e) => e.date >= baseStartStr && e.date <= baseEndStr);

    const calcPeriod = (periodEntries: DailyEntryData[]) => {
      const ran = periodEntries.filter((e) => e.sessionRan);
      const uptime = periodEntries.length
        ? (ran.length / periodEntries.length) * 100
        : 0;
      const avgEngagement = ran.length
        ? ran.reduce((acc, e) => acc + e.engagementLevel, 0) / ran.length
        : 0;
      const avgAttendance = ran.length
        ? ran.reduce((acc, e) => acc + e.studentsPresent, 0) / ran.length
        : 0;

      return {
        count: periodEntries.length,
        sessionUptime: Math.round(uptime),
        avgEngagement: Math.round(avgEngagement * 10) / 10,
        avgAttendance: Math.round(avgAttendance * 10) / 10,
      };
    };

    const baseline = calcPeriod(baseEntries);
    const experiment = calcPeriod(expEntries);

    return {
      experimentWindow: exp,
      baselinePeriod: { startDate: baseStartStr, endDate: baseEndStr, ...baseline },
      experimentPeriod: { startDate: exp.startDate, endDate: exp.endDate, ...experiment },
      lift: {
        attendanceDelta:
          Math.round((experiment.avgAttendance - baseline.avgAttendance) * 10) / 10,
        engagementDelta:
          Math.round((experiment.avgEngagement - baseline.avgEngagement) * 10) / 10,
        uptimeDelta: experiment.sessionUptime - baseline.sessionUptime,
      },
    };
  }
}

export const db = new LocalDB();
