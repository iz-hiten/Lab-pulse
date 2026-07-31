import React, { useState } from 'react';
import {
  Compass,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Smartphone,
  BarChart3,
  FlaskConical,
  FileText,
  Award,
  Zap,
  Play,
  RotateCcw
} from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

interface TourStep {
  stepNumber: number;
  tabKey: string;
  badge: string;
  title: string;
  icon: React.ElementType;
  description: string;
  highlights: string[];
  demoTip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    tabKey: 'admin',
    badge: 'MISSION & ARCHITECTURE OVERVIEW',
    title: 'Welcome to Lab Pulse Monitoring Platform',
    icon: Compass,
    description:
      'Lab Pulse replaces fragmented WhatsApp logs and Excel sheets with a real-time field operations platform for digital education programs across partner schools.',
    highlights: [
      '⚡ Zero-Setup In-Memory & SQLite/Postgres hybrid architecture ready for instant evaluation',
      '📊 4 High-Level KPI Summary Cards tracking total active labs, health index, student logs, and flags',
      '🚨 Automated Anomaly Alerts auto-detection engine for hardware & attendance drops',
    ],
    demoTip: 'Tip: Click any school card in the list to trigger the 14-day interactive drilldown chart!',
  },
  {
    stepNumber: 2,
    tabKey: 'entry',
    badge: 'MOBILE FIELD ENTRY WORKFLOW',
    title: 'Under 60-Second Teacher Daily Reporting Form',
    icon: Smartphone,
    description:
      'Optimized for rural teachers on low-tier mobile devices. Eliminates typing with large tap targets, steppers, and instant confirmation.',
    highlights: [
      '✅ Single-tap Session Status (YES / NO)',
      '➕ Quick student count stepper (-1, +1, +5, +10 buttons)',
      '⭐ 1-5 Emoji Student Engagement Rating Scale',
      '📱 Teacher Trust Feed showing last 3 submissions below the form for peace of mind',
    ],
    demoTip: 'Tip: Try submitting a test entry right now to see the Trust Feed & Dashboard update instantly!',
  },
  {
    stepNumber: 3,
    tabKey: 'admin',
    badge: 'PROGRAM HEALTH INDEX',
    title: '100-Point Weighted School Health Score',
    icon: BarChart3,
    description:
      'Every partner school receives a daily composite score: 40% Session Uptime + 30% Attendance Rate + 30% Engagement Rating.',
    highlights: [
      '🟢 Green (≥80): Operational excellence',
      '🟡 Amber (60-79): Mild attendance or engagement drop',
      '🔴 Red (<60): Urgent field manager visit required',
      '📈 Recharts composed line & bar visualization with 14-day trend analysis and CSV Export',
    ],
    demoTip: 'Tip: Use the "Export CSV" button in the drilldown header to download field entries as CSV!',
  },
  {
    stepNumber: 4,
    tabKey: 'experiments',
    badge: 'A/B INTERVENTION TRACKER',
    title: 'Product Experiment Impact Tracker',
    icon: FlaskConical,
    description:
      'Product managers can define experiment windows (e.g., solar power bank trials) and automatically measure baseline vs intervention lift.',
    highlights: [
      '🧪 Side-by-side Baseline Period vs Experiment Period comparison',
      '📊 Calculates exact delta/percentage lift in uptime, attendance, and engagement',
      '🎨 Shaded overlay directly rendered on the main dashboard trend graph',
    ],
    demoTip: 'Tip: Select Oakridge Academy to inspect the active "Solar Battery Power Station Trial"!',
  },
  {
    stepNumber: 5,
    tabKey: 'report',
    badge: 'EXECUTIVE BRIEFING & VERCEL READY',
    title: 'Executive Summary Generator & Vercel Files',
    icon: FileText,
    description:
      'Compiles all field metrics into a pre-formatted plain-text report ready for email broadcasts, C-suite updates, or Slack reports.',
    highlights: [
      '📋 One-click Copy to Clipboard & .TXT file download',
      '⚡ Complete Vercel configuration (vercel.json + serverless api/index.ts adapter) included',
      '👑 Easy Demo Role Switcher (Priya Sharma Admin vs Marcus Vance Teacher) in the top navigation',
    ],
    demoTip: 'Tip: Click "Copy to Clipboard" or "Download .TXT" to test executive report output!',
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onNavigateTab(TOUR_STEPS[nextIndex].tabKey);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onNavigateTab(TOUR_STEPS[prevIndex].tabKey);
    }
  };

  const handleJumpToStep = (index: number) => {
    setCurrentStepIndex(index);
    onNavigateTab(TOUR_STEPS[index].tabKey);
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded-lg max-w-2xl w-full p-6 sm:p-8 shadow-[10px_10px_0px_0px_#1A1A1A] space-y-6 animate-fade-in my-8 relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-4">
          <div className="flex items-center gap-2">
            <span className="bg-[#1D4ED8] text-white text-[10px] font-mono font-extrabold px-2.5 py-1 rounded border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] uppercase">
              {currentStep.badge}
            </span>
            <span className="bg-amber-100 text-[#92400E] border border-[#92400E] text-[10px] font-mono font-extrabold px-2 py-0.5 rounded">
              STEP {currentStep.stepNumber} OF {TOUR_STEPS.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="font-mono font-extrabold text-sm text-gray-500 hover:text-black bg-white border border-[#1A1A1A] px-2.5 py-1 rounded shadow-[2px_2px_0px_0px_#1A1A1A]"
            title="Close Guided Tour"
          >
            ✕
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-[#1D4ED8] text-white p-3 border-2 border-[#1A1A1A] rounded-md shadow-[3px_3px_0px_0px_#1A1A1A] shrink-0">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-mono font-extrabold text-[#1A1A1A] uppercase">
                {currentStep.title}
              </h3>
              <p className="text-xs text-gray-700 font-sans mt-1 leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Highlights List */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded-md shadow-[3px_3px_0px_0px_#1A1A1A] space-y-2">
            <div className="font-mono font-extrabold text-[11px] text-[#1A1A1A] uppercase border-b border-gray-200 pb-1.5 flex items-center justify-between">
              <span>KEY CAPABILITIES AT THIS STEP:</span>
              <span className="text-[#1D4ED8]">Interactive Feature</span>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-800 font-sans">
              {currentStep.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Demo Pro Tip */}
          <div className="bg-amber-50 border-2 border-[#92400E] p-3 rounded-md text-xs font-mono font-bold text-[#92400E] flex items-center gap-2">
            <Zap className="w-4 h-4 shrink-0 text-[#92400E]" />
            <span>{currentStep.demoTip}</span>
          </div>
        </div>

        {/* Navigation Step Dots & Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t-2 border-[#1A1A1A]">
          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.stepNumber}
                onClick={() => handleJumpToStep(idx)}
                className={`w-3 h-3 rounded-full border border-[#1A1A1A] transition-all ${
                  idx === currentStepIndex
                    ? 'bg-[#1D4ED8] w-6 shadow-[1px_1px_0px_0px_#1A1A1A]'
                    : 'bg-white hover:bg-gray-200'
                }`}
                title={`Go to Step ${s.stepNumber}: ${s.title}`}
              />
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] px-4 py-2 rounded font-mono font-extrabold text-xs shadow-[2px_2px_0px_0px_#1A1A1A] hover:bg-gray-100 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> PREV
              </button>
            )}

            <button
              onClick={handleNext}
              className="bg-[#1D4ED8] text-white border-2 border-[#1A1A1A] px-5 py-2 rounded font-mono font-extrabold text-xs shadow-[3px_3px_0px_0px_#1A1A1A] hover:bg-blue-800 flex items-center gap-1.5"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'FINISH TOUR & EXPLORE' : 'NEXT STEP'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
