export interface School {
  id: string;
  name: string;
  commuteTime: number; // in minutes
  activeLabDays: string[]; // ["Mon", "Tue", ...]
  hasDedicatedStaff: boolean;
  createdAt?: string;
}

export interface User {
  id: string; 
  name: string;
  email: string;
  role: 'entry' | 'admin';
  schoolId: string | null;
  schoolName?: string | null;
}

export interface DailyEntry {
  id: string;
  schoolId: string;
  date: string; // YYYY-MM-DD
  studentsPresent: number;
  sessionRan: boolean;
  sessionDurationMins: number | null;
  engagementLevel: number; // 1 to 5
  contentCompleted: string | null;
  technicalIssues: string | null;
  notes: string | null;
  isExperimentDay: boolean;
  submittedById: string;
  createdAt?: string;
}

export interface ExperimentWindow {
  id: string;
  schoolId: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  notes: string | null;
  createdAt?: string;
}

export interface AlertItem {
  id: string;
  schoolId: string;
  schoolName: string;
  type: 'missed_sessions' | 'attendance_drop' | 'recurring_technical_issue';
  severity: 'high' | 'medium';
  message: string;
}

export interface TrailingStats {
  attendanceRate: number;
  avgStudentsPresent: number;
  sessionUptime: number;
  avgEngagement: number;
  totalEntries: number;
  missedSessions: number;
  techIssueCount: number;
}

export interface SchoolHealthSummary {
  school: School;
  healthScore: number; // 0 - 100
  status: 'green' | 'amber' | 'red';
  trend: 'up' | 'down' | 'flat';
  trendDelta: number;
  trailingStats: TrailingStats;
  alerts: AlertItem[];
}

export interface ExperimentComparison {
  experimentWindow: ExperimentWindow;
  baselinePeriod: {
    startDate: string;
    endDate: string;
    count: number;
    sessionUptime: number;
    avgEngagement: number;
    avgAttendance: number;
  };
  experimentPeriod: {
    startDate: string;
    endDate: string;
    count: number;
    sessionUptime: number;
    avgEngagement: number;
    avgAttendance: number;
  };
  lift: {
    attendanceDelta: number;
    engagementDelta: number;
    uptimeDelta: number;
  };
}
