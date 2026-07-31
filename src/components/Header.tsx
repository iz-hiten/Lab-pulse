import React, { useState } from 'react';
import { User } from '../types';
import { Activity, Shield, User as UserIcon, RefreshCw, LogOut, Award, HelpCircle, Compass } from 'lucide-react';
import { CompanyDemoModal } from './CompanyDemoModal';

interface HeaderProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchDemoUser: (email: string) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onResetSeed: () => void;
  isResetting: boolean;
  onStartTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onSwitchDemoUser,
  onOpenLogin,
  onLogout,
  onResetSeed,
  isResetting,
  onStartTour,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  return (
    <header className="bg-[#F7F5F0] border-b-2 border-[#1A1A1A] sticky top-0 z-30 shadow-sm">
      {/* Company Submission Modal */}
      <CompanyDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />

      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="bg-[#1D4ED8] text-white p-2.5 border-2 border-[#1A1A1A] rounded-md shadow-[3px_3px_0px_0px_#1A1A1A] flex items-center justify-center">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] font-mono uppercase">
                Lab Pulse
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-extrabold bg-[#DCFCE7] text-[#166534] border border-[#166534] rounded-full shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#166534] animate-pulse"></span>
                ZERO-SETUP ENGINE READY
              </span>
            </div>
            <p className="text-xs text-[#555555] font-sans">Digital Education Field Operations &amp; Program Intelligence</p>
          </div>
        </div>

        {/* Right side Profile & Quick Demo Profile Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Onboarding Tour Trigger */}
          <button
            onClick={onStartTour}
            className="bg-[#1D4ED8] text-white border-2 border-[#1A1A1A] px-3 py-1.5 rounded-md font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#1A1A1A] hover:bg-blue-800 transition-all flex items-center gap-1.5"
            title="Start Step-by-Step Guided Tour"
          >
            <Compass className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">⚡ Guided Tour</span>
          </button>

          {/* Company Brief Modal Trigger */}
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="bg-[#FEF3C7] text-[#92400E] border-2 border-[#1A1A1A] px-3 py-1.5 rounded-md font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#1A1A1A] hover:bg-amber-200 transition-all flex items-center gap-1.5"
            title="Company Submission Executive Deck"
          >
            <Award className="w-4 h-4 text-[#92400E]" />
            <span className="hidden sm:inline">Submission Brief</span>
          </button>

          {/* Quick Demo Accounts Switcher Pill */}
          <div className="bg-white border-2 border-[#1A1A1A] rounded-md p-1 flex items-center text-xs font-mono shadow-[2px_2px_0px_0px_#1A1A1A]">
            <span className="px-2 text-[#666666] font-semibold hidden lg:inline">DEMO ROLE:</span>
            <button
              onClick={() => onSwitchDemoUser('oakridge.lab@school.edu')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                currentUser?.email === 'oakridge.lab@school.edu'
                  ? 'bg-[#1D4ED8] text-white'
                  : 'bg-gray-100 text-[#1A1A1A] hover:bg-gray-200'
              }`}
              title="Marcus Vance - Oakridge Teacher"
            >
              Teacher (Oakridge)
            </button>
            <button
              onClick={() => onSwitchDemoUser('sunrise.lab@school.edu')}
              className={`px-2 py-1 rounded font-bold transition-all ml-1 ${
                currentUser?.email === 'sunrise.lab@school.edu'
                  ? 'bg-[#1D4ED8] text-white'
                  : 'bg-gray-100 text-[#1A1A1A] hover:bg-gray-200'
              }`}
              title="Amina Nkosi - Sunrise Teacher"
            >
              Teacher (Sunrise)
            </button>
            <button
              onClick={() => onSwitchDemoUser('admin@labpulse.org')}
              className={`px-2 py-1 rounded font-bold transition-all ml-1 ${
                currentUser?.email === 'admin@labpulse.org'
                  ? 'bg-[#D97706] text-white'
                  : 'bg-amber-100 text-[#92400E] hover:bg-amber-200'
              }`}
              title="Priya Sharma - Program Manager"
            >
              👑 Admin Manager
            </button>
          </div>

          {/* Reset Seed Button */}
          <button
            onClick={onResetSeed}
            disabled={isResetting}
            className="p-1.5 bg-white border-2 border-[#1A1A1A] rounded-md shadow-[2px_2px_0px_0px_#1A1A1A] text-xs font-bold hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
            title="Reset Database to Seed State"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden xl:inline">Reset Seed</span>
          </button>

          {/* User Profile / Logout */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-[#1A1A1A] text-white px-3 py-1.5 border-2 border-[#1A1A1A] rounded-md text-xs font-mono">
              <UserIcon className="w-3.5 h-3.5 text-[#FEF3C7]" />
              <div className="text-left leading-tight hidden xl:block">
                <div className="font-bold truncate max-w-[120px]">{currentUser.name}</div>
                <div className="text-[10px] text-gray-300">
                  {isAdmin ? 'ADMIN' : currentUser.schoolName || 'ENTRY USER'}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="ml-1 text-gray-400 hover:text-white"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="bg-[#1A1A1A] text-white px-3 py-1.5 border-2 border-[#1A1A1A] rounded-md text-xs font-bold font-mono hover:bg-gray-800"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#1A1A1A]/20">
        <nav className="flex space-x-2 sm:space-x-4 py-2 overflow-x-auto">
          {/* Entry Tab for Teachers */}
          <button
            onClick={() => setActiveTab('entry')}
            className={`px-3 py-2 text-xs sm:text-sm font-bold font-mono border-2 border-[#1A1A1A] rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'entry'
                ? 'bg-[#1D4ED8] text-white shadow-[2px_2px_0px_0px_#1A1A1A]'
                : 'bg-white text-[#1A1A1A] hover:bg-gray-100 shadow-[2px_2px_0px_0px_#1A1A1A]'
            }`}
          >
            <span>📱</span> Daily Field Entry
            {currentUser?.role === 'entry' && (
              <span className="bg-amber-300 text-black text-[10px] px-1.5 py-0.2 rounded font-sans">
                YOUR SCOPE
              </span>
            )}
          </button>

          {/* Admin Dashboard Tab */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-2 text-xs sm:text-sm font-bold font-mono border-2 border-[#1A1A1A] rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-[#1D4ED8] text-white shadow-[2px_2px_0px_0px_#1A1A1A]'
                : 'bg-white text-[#1A1A1A] hover:bg-gray-100 shadow-[2px_2px_0px_0px_#1A1A1A]'
            }`}
          >
            <span>📊</span> Program Analytics
            {isAdmin && (
              <span className="bg-emerald-300 text-black text-[10px] px-1.5 py-0.2 rounded font-sans">
                ADMIN
              </span>
            )}
          </button>

          {/* Experiment Mode Tab */}
          <button
            onClick={() => setActiveTab('experiments')}
            className={`px-3 py-2 text-xs sm:text-sm font-bold font-mono border-2 border-[#1A1A1A] rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'experiments'
                ? 'bg-[#1D4ED8] text-white shadow-[2px_2px_0px_0px_#1A1A1A]'
                : 'bg-white text-[#1A1A1A] hover:bg-gray-100 shadow-[2px_2px_0px_0px_#1A1A1A]'
            }`}
          >
            <span>🔬</span> Experiment Tracker
          </button>

          {/* User Management Tab (Admin Only or Accessible) */}
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 text-xs sm:text-sm font-bold font-mono border-2 border-[#1A1A1A] rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-[#1D4ED8] text-white shadow-[2px_2px_0px_0px_#1A1A1A]'
                : 'bg-white text-[#1A1A1A] hover:bg-gray-100 shadow-[2px_2px_0px_0px_#1A1A1A]'
            }`}
          >
            <span>👥</span> Users & Schools
          </button>

          {/* Weekly Report Export Tab */}
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-2 text-xs sm:text-sm font-bold font-mono border-2 border-[#1A1A1A] rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'report'
                ? 'bg-[#1D4ED8] text-white shadow-[2px_2px_0px_0px_#1A1A1A]'
                : 'bg-white text-[#1A1A1A] hover:bg-gray-100 shadow-[2px_2px_0px_0px_#1A1A1A]'
            }`}
          >
            <span>📝</span> Executive Report
          </button>
        </nav>
      </div>
    </header>
  );
};
