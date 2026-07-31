// Mock data for frontend-only mode
import { School, User, DailyEntry, ExperimentWindow, SchoolHealthSummary, AlertItem } from '../types';

function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export const mockSchools: School[] = [
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

export const mockUsers: User[] = [
  {
    id: 'user-admin',
    name: 'Priya Sharma (Program Mgr)',
    email: 'admin@labpulse.org',
    role: 'admin',
    schoolId: null,
    schoolName: null,
  },
  {
    id: 'user-oakridge',
    name: 'Marcus Vance',
    email: 'oakridge.lab@school.edu',
    role: 'entry',
    schoolId: 'school-oakridge',
    schoolName: 'Oakridge Community High School',
  },
  {
    id: 'user-sunrise',
    name: 'Amina Nkosi',
    email: 'sunrise.lab@school.edu',
    role: 'entry',
    schoolId: 'school-sunrise',
    schoolName: 'Sunrise Valley Academy',
  },
  {
    id: 'user-horizon',
    name: 'David Chen',
    email: 'horizon.lab@school.edu',
    role: 'entry',
    schoolId: 'school-horizon',
    schoolName: 'Horizon STEM Technical Academy',
  },
];

export const mockEntries: DailyEntry[] = [];

// Generate 14 days of entries
for (let offset = 14; offset >= 0; offset--) {
  const dateStr = getDateOffset(-offset);
  const dateObj = new Date(dateStr);
  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) continue;

  const oakExp = offset >= 1 && offset <= 7;
  mockEntries.push({
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
  mockEntries.push({
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
    mockEntries.push({
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

export const mockExperiments: ExperimentWindow[] = [
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

// Calculate health summaries
function calculateSchoolHealth(school: School, entries: DailyEntry[]): SchoolHealthSummary {
  const schoolEntries = entries.filter(e => e.schoolId === school.id).slice(0, 14);
  const current7 = schoolEntries.slice(0, 7);
  const prev7 = schoolEntries.slice(7, 14);

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

  const alerts: AlertItem[] = [];
  
  // Alert for tech issues
  const techFailures = current7.filter(e => e.technicalIssues && e.technicalIssues.trim().length > 0);
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

  // Alert for low attendance
  const ranEntries = current7.filter(e => e.sessionRan);
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

export const mockHealthSummaries: SchoolHealthSummary[] = mockSchools.map(school => 
  calculateSchoolHealth(school, mockEntries)
);

export const mockAlerts: AlertItem[] = mockHealthSummaries.flatMap(s => s.alerts);

// Mock API functions
export const mockAPI = {
  login: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('Invalid credentials');
    
    return {
      token: `mock-token-${user.id}`,
      user,
    };
  },

  getMe: async (token: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const userId = token.replace('mock-token-', '');
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    return user;
  },

  getSchools: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      summaries: mockHealthSummaries,
      alerts: mockAlerts,
    };
  },

  getSchoolDetail: async (schoolId: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const summary = mockHealthSummaries.find(s => s.school.id === schoolId);
    if (!summary) throw new Error('School not found');
    
    const entries = mockEntries.filter(e => e.schoolId === schoolId);
    const experiments = mockExperiments.filter(e => e.schoolId === schoolId);
    
    return {
      ...summary,
      entries,
      experiments,
    };
  },

  getEntries: async (schoolId?: string, limit?: number) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let entries = [...mockEntries];
    if (schoolId) entries = entries.filter(e => e.schoolId === schoolId);
    entries.sort((a, b) => (a.date < b.date ? 1 : -1));
    if (limit) entries = entries.slice(0, limit);
    return entries;
  },

  createEntry: async (entryData: Omit<DailyEntry, 'id' | 'createdAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newEntry: DailyEntry = {
      ...entryData,
      id: `entry-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockEntries.unshift(newEntry);
    return newEntry;
  },

  getUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers;
  },

  createSchool: async (schoolData: Omit<School, 'id' | 'createdAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newSchool: School = {
      ...schoolData,
      id: `school-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockSchools.push(newSchool);
    return newSchool;
  },
};
