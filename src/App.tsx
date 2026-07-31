import React, { useState, useEffect } from 'react';
import { School, User, SchoolHealthSummary, AlertItem, DailyEntry } from './types';
import { Header } from './components/Header';
import { EntryView } from './components/EntryView';
import { AdminDashboard } from './components/AdminDashboard';
import { ExperimentView } from './components/ExperimentView';
import { UserManagementView } from './components/UserManagementView';
import { WeeklyReportView } from './components/WeeklyReportView';
import { LoginModal } from './components/LoginModal';
import { OnboardingTour } from './components/OnboardingTour';
import {
  loginUserDirect,
  getDashboardSummaryDirect,
  getSchoolDrilldownDirect
} from './services/firestoreService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>('entry');
  const [schools, setSchools] = useState<School[]>([]);
  const [healthSummaries, setHealthSummaries] = useState<SchoolHealthSummary[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // Selected school for admin drilldown
  const [selectedSchoolSummary, setSelectedSchoolSummary] = useState<
    (SchoolHealthSummary & { entries: DailyEntry[] }) | null
  >(null);

  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  // Auto-login default user on first load
  const loginDefaultUser = async (email: string = 'oakridge.lab@school.edu') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuthToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem('labpulse_token', data.token);
        return;
      }
    } catch (err) {
      console.warn('API login unavailable, connecting via Firestore database:', err);
    }

    // Direct Firestore fallback
    try {
      const directData = await loginUserDirect(email);
      setAuthToken(directData.token);
      setCurrentUser(directData.user);
      localStorage.setItem('labpulse_token', directData.token);
    } catch (fsErr) {
      console.error('Firestore login failed:', fsErr);
    }
  };

  // Fetch schools and health summaries
  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/schools');
      if (res.ok) {
        const data = await res.json();
        setHealthSummaries(data.summaries || []);
        setAlerts(data.alerts || []);
        const schoolsList = (data.summaries || []).map((s: SchoolHealthSummary) => s.school);
        setSchools(schoolsList);

        if (schoolsList.length > 0 && !selectedSchoolSummary) {
          fetchSchoolDrilldown(schoolsList[0].id);
        }
        return;
      }
    } catch (err) {
      console.warn('API dashboard endpoint unavailable, fetching directly from Firestore:', err);
    }

    // Direct Firestore fallback
    try {
      const data = await getDashboardSummaryDirect();
      setHealthSummaries(data.summaries);
      setAlerts(data.alerts);
      const schoolsList = data.summaries.map(s => s.school);
      setSchools(schoolsList);

      if (schoolsList.length > 0 && !selectedSchoolSummary) {
        fetchSchoolDrilldown(schoolsList[0].id);
      }
    } catch (fsErr) {
      console.error('Firestore fetch failed:', fsErr);
    }
  };

  const fetchSchoolDrilldown = async (schoolId: string) => {
    try {
      const res = await fetch(`/api/schools/${schoolId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSchoolSummary(data);
        return;
      }
    } catch (err) {
      console.warn('API drilldown unavailable, fetching directly from Firestore:', err);
    }

    // Direct Firestore fallback
    try {
      const data = await getSchoolDrilldownDirect(schoolId);
      setSelectedSchoolSummary(data);
    } catch (fsErr) {
      console.error('Firestore drilldown failed:', fsErr);
    }
  };


  useEffect(() => {
    fetchDashboardData();
    loginDefaultUser('oakridge.lab@school.edu');

    // Auto launch tour once on first load for hiring manager/reviewer
    const tourSeen = localStorage.getItem('labpulse_tour_seen');
    if (!tourSeen) {
      setIsTourOpen(true);
    }
  }, []);

  const handleSelectSchoolForDrilldown = (schoolId: string) => {
    fetchSchoolDrilldown(schoolId);
    setActiveTab('admin');
  };

  const handleSwitchDemoUser = async (email: string) => {
    await loginDefaultUser(email);
    // Automatically switch tabs based on role
    if (email === 'admin@labpulse.org') {
      setActiveTab('admin');
    } else {
      setActiveTab('entry');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('labpulse_token');
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset Lab Pulse database back to initial seed data?')) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      if (res.ok) {
        await fetchDashboardData();
        if (currentUser?.email) {
          loginDefaultUser(currentUser.email);
        }
      }
    } catch (err) {
      console.error('Failed to reset database', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#1D4ED8] selection:text-white">
      {/* HEADER */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchDemoUser={handleSwitchDemoUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onResetSeed={handleResetSeed}
        isResetting={isResetting}
        onStartTour={() => setIsTourOpen(true)}
      />

      {/* ONBOARDING TOUR MODAL */}
      <OnboardingTour
        isOpen={isTourOpen}
        onClose={() => {
          setIsTourOpen(false);
          localStorage.setItem('labpulse_tour_seen', 'true');
        }}
        onNavigateTab={(tabKey) => setActiveTab(tabKey)}
      />

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 pb-16">
        {activeTab === 'entry' && (
          <EntryView
            currentUser={currentUser}
            schools={schools}
            onEntrySubmitted={fetchDashboardData}
            authToken={authToken}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            summaries={healthSummaries}
            alerts={alerts}
            onSelectSchoolForDrilldown={handleSelectSchoolForDrilldown}
            selectedSchoolSummary={selectedSchoolSummary}
            onRefreshData={fetchDashboardData}
          />
        )}

        {activeTab === 'experiments' && (
          <ExperimentView
            schools={schools}
            authToken={authToken}
            isAdmin={currentUser?.role === 'admin'}
          />
        )}

        {activeTab === 'users' && (
          <UserManagementView
            schools={schools}
            authToken={authToken}
            isAdmin={currentUser?.role === 'admin'}
            onRefreshSchools={fetchDashboardData}
          />
        )}

        {activeTab === 'report' && <WeeklyReportView />}
      </main>

      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(token, user) => {
          setAuthToken(token);
          setCurrentUser(user);
          localStorage.setItem('labpulse_token', token);
          if (user.role === 'admin') setActiveTab('admin');
        }}
      />

      {/* FOOTER */}
      <footer className="border-t-2 border-[#1A1A1A] bg-[#1A1A1A] text-white py-6 px-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-extrabold uppercase text-[#FEF3C7]">LAB PULSE</span> • Field Monitoring Dashboard
          </div>
          <div className="text-gray-400">
            Deployed on Cloud Run / Vercel Serverless Architecture • Prisma ORM & NextAuth Ready
          </div>
        </div>
      </footer>
    </div>
  );
}
