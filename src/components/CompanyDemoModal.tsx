import React from 'react';
import { Award, CheckCircle2, Database, ShieldCheck, Zap, BarChart3, FileSpreadsheet, Clock, Building2, Terminal } from 'lucide-react';

interface CompanyDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyDemoModal: React.FC<CompanyDemoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded-lg max-w-3xl w-full p-6 sm:p-8 shadow-[10px_10px_0px_0px_#1A1A1A] space-y-6 animate-fade-in my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[#1A1A1A] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#1D4ED8] text-white text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]">
                ENTERPRISE EVALUATION BRIEF
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-mono font-extrabold px-2 py-0.5 rounded border border-emerald-400">
                ZERO-SETUP READY
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-mono font-extrabold text-[#1A1A1A] uppercase flex items-center gap-2 pt-1">
              <Award className="w-6 h-6 text-[#1D4ED8]" />
              Lab Pulse — Executive Submission Deck
            </h2>
            <p className="text-xs text-gray-600 font-sans">
              Digital Education Field Monitoring & Operations Intelligence Platform
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-mono font-extrabold text-lg text-gray-500 hover:text-black bg-white border border-[#1A1A1A] px-2.5 py-1 rounded shadow-[2px_2px_0px_0px_#1A1A1A]"
          >
            ✕
          </button>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
          
          <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded shadow-[3px_3px_0px_0px_#1A1A1A] space-y-2">
            <div className="flex items-center gap-2 font-mono font-bold text-[#1D4ED8] text-sm uppercase">
              <Clock className="w-4 h-4" />
              &lt;60s Field Entry Form
            </div>
            <p className="text-gray-700 leading-relaxed">
              Designed for non-technical rural teachers on low-bandwidth mobile connections. Features single-tap session status, touch-optimized stepper controls (-1, +1, +5, +10), 1-5 emoji scale, and instantaneous submission confirmation.
            </p>
          </div>

          <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded shadow-[3px_3px_0px_0px_#1A1A1A] space-y-2">
            <div className="flex items-center gap-2 font-mono font-bold text-amber-700 text-sm uppercase">
              <BarChart3 className="w-4 h-4" />
              Weighted Health Index
            </div>
            <p className="text-gray-700 leading-relaxed">
              Automated 100-point school health index updated daily: <strong>40% Session Uptime</strong> + <strong>30% Attendance Rate</strong> + <strong>30% Student Engagement</strong>, with color-coded green/amber/red performance tiers.
            </p>
          </div>

          <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded shadow-[3px_3px_0px_0px_#1A1A1A] space-y-2">
            <div className="flex items-center gap-2 font-mono font-bold text-red-700 text-sm uppercase">
              <Zap className="w-4 h-4" />
              Automated Incident Alerts
            </div>
            <p className="text-gray-700 leading-relaxed">
              Flags high-severity operational anomalies automatically: 2+ missed sessions in 7 days, attendance drops &gt;20%, or 3+ consecutive days of solar power/hardware failures.
            </p>
          </div>

          <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded shadow-[3px_3px_0px_0px_#1A1A1A] space-y-2">
            <div className="flex items-center gap-2 font-mono font-bold text-emerald-700 text-sm uppercase">
              <Database className="w-4 h-4" />
              Zero-Setup Built-In Store
            </div>
            <p className="text-gray-700 leading-relaxed">
              No external database setup required! Powered by an integrated, fully self-contained JSON/in-memory data engine pre-seeded with 14 days of realistic field data, while also providing full Prisma/PostgreSQL compatibility for production scale.
            </p>
          </div>

        </div>

        {/* Technical Stack Overview */}
        <div className="bg-gray-900 text-gray-100 border-2 border-[#1A1A1A] p-4 sm:p-5 rounded-md font-mono text-xs space-y-3 shadow-[4px_4px_0px_0px_#1A1A1A]">
          <div className="flex items-center justify-between border-b border-gray-700 pb-2 text-amber-400 font-bold">
            <span className="flex items-center gap-2 uppercase">
              <Terminal className="w-4 h-4" /> TECHNICAL ARCHITECTURE & STACK
            </span>
            <span className="text-[10px] text-gray-400">ENTERPRISE-GRADE</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div>
              <span className="text-gray-400 block text-[10px]">FRONTEND</span>
              <span className="font-bold text-white">React 18 + Vite</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">STYLING</span>
              <span className="font-bold text-white">Tailwind CSS v4</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">BACKEND</span>
              <span className="font-bold text-white">Express TypeScript</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">DATA ENGINE</span>
              <span className="font-bold text-emerald-400">Zero-Config LocalDB</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-[#1A1A1A]">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ready for instant evaluation &amp; demonstration</span>
          </div>

          <button
            onClick={onClose}
            className="bg-[#1D4ED8] text-white border-2 border-[#1A1A1A] px-6 py-2.5 rounded font-mono font-extrabold text-xs shadow-[3px_3px_0px_0px_#1A1A1A] hover:bg-blue-800 transition-all"
          >
            CONTINUE TO LIVE DEMO
          </button>
        </div>

      </div>
    </div>
  );
};
