import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit as limitQuery
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { School, User, DailyEntry, ExperimentWindow, SchoolHealthSummary, AlertItem } from '../types';

function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

// Initial Seed Generator
export function generateInitialSeed() {
  const schools: School[] = [
    {
      id: 'school-oakridge',
      name: 'Oakridge Academy',
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

  const users: (User & { passwordHash: string })[] = [
    {
      id: 'user-admin',
      name: 'Priya Sharma (Program Mgr)',
      email: 'admin@labpulse.org',
      passwordHash: '$2a$10$abcdefghijklmnopqrstuu',
      role: 'admin',
      schoolId: null,
    },
    {
      id: 'user-oakridge',
      name: 'Marcus Vance',
      email: 'oakridge.lab@school.edu',
      passwordHash: '$2a$10$abcdefghijklmnopqrstuu',
      role: 'entry',
      schoolId: 'school-oakridge',
    },
    {
      id: 'user-sunrise',
      name: 'Amina Nkosi',
      email: 'sunrise.lab@school.edu',
      passwordHash: '$2a$10$abcdefghijklmnopqrstuu',
      role: 'entry',
      schoolId: 'school-sunrise',
    },
    {
      id: 'user-horizon',
      name: 'David Chen',
      email: 'horizon.lab@school.edu',
      passwordHash: '$2a$10$abcdefghijklmnopqrstuu',
      role: 'entry',
      schoolId: 'school-horizon',
    },
  ];

  const experiments: ExperimentWindow[] = [
    {
      id: 'exp-oakridge-gamified',
      schoolId: 'school-oakridge',
      title: 'Gamified Science Modules (v2.1)',
      startDate: getDateOffset(-7),
      endDate: getDateOffset(-1),
      notes: 'Testing interactive badge rewards for speed and accuracy.',
    },
  ];

  const entries: DailyEntry[] = [];

  for (let offset = 14; offset >= 0; offset--) {
    const dateStr = getDateOffset(-offset);
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

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

    const sunriseRan = offset !== 1 && offset !== 2 && offset !== 5;
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

    if (dayOfWeek !== 5) {
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

// In-Memory Fallback & Sync Cache
let localMemoryData = generateInitialSeed();

// Ensure Firestore is seeded on first app run if empty
export async function seedFirestoreIfEmpty() {
  try {
    const schoolsSnap = await getDocs(collection(firestore, 'schools'));
    if (schoolsSnap.empty) {
      const seed = generateInitialSeed();
      for (const s of seed.schools) {
        await setDoc(doc(firestore, 'schools', s.id), s);
      }
      for (const u of seed.users) {
        await setDoc(doc(firestore, 'users', u.id), u);
      }
      for (const e of seed.entries) {
        await setDoc(doc(firestore, 'entries', e.id), e);
      }
      for (const exp of seed.experiments) {
        await setDoc(doc(firestore, 'experiments', exp.id), exp);
      }
      console.log('Firestore initialized with seed data!');
    }
  } catch (err) {
    console.warn('Firestore seeding check (offline or delayed):', err);
  }
}

// Fire-and-forget background seed check
seedFirestoreIfEmpty();

// --- FIRESTORE DATA ACCESSORS ---

export async function fetchSchools(): Promise<School[]> {
  try {
    const snap = await getDocs(collection(firestore, 'schools'));
    if (!snap.empty) {
      const schools = snap.docs.map(doc => doc.data() as School);
      localMemoryData.schools = schools;
      return schools;
    }
  } catch (err) {
    console.warn('Using local fallback for schools:', err);
  }
  return localMemoryData.schools;
}

export async function fetchEntries(schoolId?: string, limitCount?: number): Promise<DailyEntry[]> {
  try {
    const colRef = collection(firestore, 'entries');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      let entries = snap.docs.map(doc => doc.data() as DailyEntry);
      if (schoolId) {
        entries = entries.filter(e => e.schoolId === schoolId);
      }
      entries.sort((a, b) => (a.date < b.date ? 1 : -1));
      if (limitCount) {
        entries = entries.slice(0, limitCount);
      }
      return entries;
    }
  } catch (err) {
    console.warn('Using local fallback for entries:', err);
  }
  let entries = [...localMemoryData.entries];
  if (schoolId) entries = entries.filter(e => e.schoolId === schoolId);
  entries.sort((a, b) => (a.date < b.date ? 1 : -1));
  if (limitCount) entries = entries.slice(0, limitCount);
  return entries;
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const snap = await getDocs(collection(firestore, 'users'));
    if (!snap.empty) {
      return snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          schoolId: data.schoolId || null,
        } as User;
      });
    }
  } catch (err) {
    console.warn('Using local fallback for users:', err);
  }
  return localMemoryData.users.map(({ passwordHash, ...u }) => u);
}

export async function fetchExperiments(schoolId?: string): Promise<ExperimentWindow[]> {
  try {
    const snap = await getDocs(collection(firestore, 'experiments'));
    if (!snap.empty) {
      let exps = snap.docs.map(doc => doc.data() as ExperimentWindow);
      if (schoolId) exps = exps.filter(e => e.schoolId === schoolId);
      return exps;
    }
  } catch (err) {
    console.warn('Using local fallback for experiments:', err);
  }
  let exps = [...localMemoryData.experiments];
  if (schoolId) exps = exps.filter(e => e.schoolId === schoolId);
  return exps;
}

export async function createEntryInFirestore(entryData: Omit<DailyEntry, 'id' | 'createdAt'>): Promise<DailyEntry> {
  const newEntry: DailyEntry = {
    ...entryData,
    id: `entry-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  // Update memory immediately
  localMemoryData.entries.unshift(newEntry);

  try {
    await setDoc(doc(firestore, 'entries', newEntry.id), newEntry);
  } catch (err) {
    console.warn('Firestore entry save error, saved in memory:', err);
  }

  return newEntry;
}

export async function createSchoolInFirestore(schoolData: Omit<School, 'id' | 'createdAt'>): Promise<School> {
  const newSchool: School = {
    ...schoolData,
    id: `school-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  localMemoryData.schools.push(newSchool);

  try {
    await setDoc(doc(firestore, 'schools', newSchool.id), newSchool);
  } catch (err) {
    console.warn('Firestore school save error, saved in memory:', err);
  }

  return newSchool;
}

export async function createExperimentInFirestore(expData: Omit<ExperimentWindow, 'id'>): Promise<ExperimentWindow> {
  const newExp: ExperimentWindow = {
    ...expData,
    id: `exp-${Date.now()}`,
  };

  localMemoryData.experiments.push(newExp);

  try {
    await setDoc(doc(firestore, 'experiments', newExp.id), newExp);
  } catch (err) {
    console.warn('Firestore experiment save error, saved in memory:', err);
  }

  return newExp;
}

export async function loginUserDirect(email: string): Promise<{ token: string; user: User }> {
  const users = await fetchUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || users[0];
  const schools = await fetchSchools();
  const school = found.schoolId ? schools.find(s => s.id === found.schoolId) : null;
  return {
    token: `token-${found.id}-${Date.now()}`,
    user: {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      schoolId: found.schoolId,
      schoolName: school?.name || null,
    }
  };
}

export async function getDashboardSummaryDirect() {
  const schools = await fetchSchools();
  const entries = await fetchEntries();
  const summaries = schools.map(s => calculateSchoolHealthFromEntries(s, entries));
  const alerts = detectAlertsFromEntries(schools, entries);
  return { summaries, alerts };
}

export async function getSchoolDrilldownDirect(schoolId: string) {
  const schools = await fetchSchools();
  const school = schools.find(s => s.id === schoolId) || schools[0];
  const entries = await fetchEntries(schoolId);
  const experiments = await fetchExperiments(schoolId);
  const allEntries = await fetchEntries();
  const summary = calculateSchoolHealthFromEntries(school, allEntries);

  return {
    ...summary,
    entries,
    experiments,
  };
}


// Calculate 100-Point Composite Health Summaries
export function calculateSchoolHealthFromEntries(school: School, allEntries: DailyEntry[]): SchoolHealthSummary {
  const schoolEntries = allEntries.filter(e => e.schoolId === school.id);
  const trailing14 = schoolEntries.slice(0, 14);
  const current7 = trailing14.slice(0, 7);
  const prev7 = trailing14.slice(7, 14);

  const calcStats = (list: DailyEntry[]) => {
    if (list.length === 0) return {
      sessionUptime: 100,
      avgStudentsPresent: 0,
      avgEngagement: 5,
      attendanceRate: 100,
      totalEntries: 0,
      missedSessions: 0,
      techIssueCount: 0
    };
    const ranCount = list.filter(e => e.sessionRan).length;
    const sessionUptime = (ranCount / list.length) * 100;
    const ranEntries = list.filter(e => e.sessionRan);
    const avgStudentsPresent = ranEntries.length > 0
      ? ranEntries.reduce((acc, e) => acc + e.studentsPresent, 0) / ranEntries.length
      : 0;
    const avgEngagement = ranEntries.length > 0
      ? ranEntries.reduce((acc, e) => acc + e.engagementLevel, 0) / ranEntries.length
      : 0;
    const attendanceRate = Math.min((avgStudentsPresent / 30) * 100, 100);
    const totalEntries = list.length;
    const missedSessions = list.length - ranCount;
    const techIssueCount = list.filter(e => e.technicalIssues && e.technicalIssues.trim().length > 0).length;

    return {
      sessionUptime,
      avgStudentsPresent,
      avgEngagement,
      attendanceRate,
      totalEntries,
      missedSessions,
      techIssueCount
    };
  };

  const currStats = calcStats(current7);
  const prevStats = calcStats(prev7);

  const uptimeScore = (currStats.sessionUptime / 100) * 40;
  const attendanceScore = Math.min(currStats.avgStudentsPresent / 30, 1) * 30;
  const engagementScore = (currStats.avgEngagement / 5) * 30;
  const healthScore = Math.round(uptimeScore + attendanceScore + engagementScore);

  const prevUptime = (prevStats.sessionUptime / 100) * 40;
  const prevAtt = Math.min(prevStats.avgStudentsPresent / 30, 1) * 30;
  const prevEng = (prevStats.avgEngagement / 5) * 30;
  const prevHealthScore = Math.round(prevUptime + prevAtt + prevEng);

  const trendDelta = healthScore - prevHealthScore;
  const trend = trendDelta > 0 ? 'up' : trendDelta < 0 ? 'down' : 'flat';
  const status = healthScore >= 80 ? 'green' : healthScore >= 60 ? 'amber' : 'red';

  const alerts = detectAlertsFromEntries([school], schoolEntries);

  return {
    school,
    healthScore,
    status,
    trend,
    trendDelta,
    trailingStats: currStats,
    alerts,
  };
}

export function detectAlertsFromEntries(schools: School[], entries: DailyEntry[]): AlertItem[] {
  const alerts: AlertItem[] = [];

  schools.forEach(school => {
    const schoolEntries = entries.filter(e => e.schoolId === school.id);
    const trailing7 = schoolEntries.slice(0, 7);

    // Tech Issue Check
    const techFailures = trailing7.filter(e => e.technicalIssues && e.technicalIssues.trim().length > 0);
    if (techFailures.length >= 2) {
      alerts.push({
        id: `alert-tech-${school.id}`,
        schoolId: school.id,
        schoolName: school.name,
        type: 'recurring_technical_issue',
        severity: 'high',
        message: `${techFailures.length} technical blockers reported in the last 7 days (e.g. "${techFailures[0].technicalIssues}").`,
      });
    }

    // Attendance Drop Check
    const ranEntries = trailing7.filter(e => e.sessionRan);
    if (ranEntries.length >= 3) {
      const avgAtt = ranEntries.reduce((sum, e) => sum + e.studentsPresent, 0) / ranEntries.length;
      if (avgAtt < 15) {
        alerts.push({
          id: `alert-att-${school.id}`,
          schoolId: school.id,
          schoolName: school.name,
          type: 'attendance_drop',
          severity: 'medium',
          message: `Average attendance dropped to ${Math.round(avgAtt)} students per session in the past 7 days.`,
        });
      }
    }
  });

  return alerts;
}
