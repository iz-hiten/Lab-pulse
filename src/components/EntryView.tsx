import React, { useState, useEffect } from 'react';
import { User, School, DailyEntry } from '../types';
import {
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  Building2,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface EntryViewProps {
  currentUser: User | null;
  schools: School[];
  onEntrySubmitted: () => void;
  authToken: string | null;
}

export const EntryView: React.FC<EntryViewProps> = ({
  currentUser,
  schools,
  onEntrySubmitted,
  authToken,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Assigned school logic
  const defaultSchoolId =
    currentUser?.schoolId || (schools.length > 0 ? schools[0].id : '');

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(defaultSchoolId);
  const [dateStr, setDateStr] = useState<string>(todayStr);

  // Form states
  const [sessionRan, setSessionRan] = useState<boolean>(true);
  const [studentsPresent, setStudentsPresent] = useState<number>(24);
  const [engagementLevel, setEngagementLevel] = useState<number>(4);
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [technicalIssues, setTechnicalIssues] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [contentCompleted, setContentCompleted] = useState<string>('');
  const [isExperimentDay, setIsExperimentDay] = useState<boolean>(false);

  // Collapsible accordion toggles
  const [showTechAccordion, setShowTechAccordion] = useState<boolean>(false);
  const [showNotesAccordion, setShowNotesAccordion] = useState<boolean>(false);

  // UI status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [recentEntries, setRecentEntries] = useState<DailyEntry[]>([]);

  // Selected school object
  const assignedSchool = schools.find((s) => s.id === selectedSchoolId);

  // Fetch recent submissions for this school
  const fetchRecentSubmissions = async (schoolId: string) => {
    if (!schoolId) return;
    try {
      const res = await fetch(`/api/entries/recent/${schoolId}`);
      if (res.ok) {
        const data = await res.json();
        setRecentEntries(data);
      }
    } catch (err) {
      console.error('Failed to fetch recent submissions', err);
    }
  };

  useEffect(() => {
    if (currentUser?.schoolId) {
      setSelectedSchoolId(currentUser.schoolId);
    } else if (schools.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [currentUser, schools]);

  useEffect(() => {
    if (selectedSchoolId) {
      fetchRecentSubmissions(selectedSchoolId);
    }
  }, [selectedSchoolId]);

  // Stepper handlers
  const updateStudents = (delta: number) => {
    setStudentsPresent((prev) => Math.max(0, Math.min(100, prev + delta)));
  };

  // Quick technical issue tags
  const quickTechTags = [
    'Wi-Fi Disconnected',
    'Power Inverter Trip',
    'Chromebook Battery Dead',
    'Projector Bulb Out',
    'Server Connection Timeout',
  ];

  const handleAddTechTag = (tag: string) => {
    setTechnicalIssues((prev) => (prev ? `${prev}; ${tag}` : tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    const payload = {
      schoolId: selectedSchoolId,
      date: dateStr,
      sessionRan,
      studentsPresent: sessionRan ? studentsPresent : 0,
      sessionDurationMins: sessionRan ? 45 : null,
      engagementLevel: sessionRan ? engagementLevel : 1,
      contentCompleted: sessionRan ? contentCompleted || null : null,
      technicalIssues: sessionRan ? (technicalIssues || null) : (cancellationReason || 'Session Cancelled'),
      notes: notes || null,
      isExperimentDay: sessionRan && isExperimentDay,
    };

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        onEntrySubmitted();
        fetchRecentSubmissions(selectedSchoolId);
        setTimeout(() => setSubmitSuccess(false), 4000);
      } else {
        alert('Failed to submit entry. Please verify inputs and try again.');
      }
    } catch (err) {
      console.error('Error submitting entry', err);
      alert('Error submitting report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header Info */}
      <div className="mb-6 bg-white border-2 border-[#1A1A1A] rounded-md p-4 shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#1A1A1A] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#1D4ED8]" />
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-gray-500">
              ASSIGNED SCHOOL
            </span>
          </div>
          <span className="text-xs font-mono bg-amber-100 text-[#92400E] border border-[#92400E] px-2 py-0.5 rounded font-bold">
            ⚡ RAPID MOBILE FORM
          </span>
        </div>

        {/* School Dropdown or Auto-filled Badge */}
        {currentUser?.role === 'admin' || !currentUser?.schoolId ? (
          <div>
            <label className="block text-xs font-bold font-mono text-gray-700 mb-1">
              SELECT SCHOOL:
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded p-2 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.commuteTime}m commute)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#1A1A1A]">
                {assignedSchool?.name || 'Oakridge Community High School'}
              </h2>
              <p className="text-xs text-gray-600 font-mono mt-0.5">
                Staff: {assignedSchool?.hasDedicatedStaff ? 'Dedicated Lab Coordinator' : 'Classroom Teacher'} • Commute: {assignedSchool?.commuteTime} mins
              </p>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs font-mono">
          <span className="text-gray-500">LOG DATE:</span>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded px-2 py-1 font-bold focus:outline-none text-xs"
          />
        </div>
      </div>

      {/* SUCCESS TOAST */}
      {submitSuccess && (
        <div className="mb-6 bg-[#DCFCE7] border-2 border-[#166534] p-4 rounded-md shadow-[4px_4px_0px_0px_#166534] flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-[#166534] flex-shrink-0" />
          <div>
            <h4 className="font-mono font-bold text-[#166534]">REPORT SUBMITTED SUCCESSFULLY!</h4>
            <p className="text-xs text-[#166534]">
              Data saved to Lab Pulse database. Your health score has been updated in real-time.
            </p>
          </div>
        </div>
      )}

      {/* ENTRY FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* FIELD 1: DID THE SESSION RUN? */}
        <div className="bg-white border-2 border-[#1A1A1A] rounded-md p-5 shadow-[4px_4px_0px_0px_#1A1A1A]">
          <label className="block text-sm font-bold font-mono text-[#1A1A1A] mb-3">
            1. DID THE LAB SESSION RUN TODAY?
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSessionRan(true)}
              className={`p-4 border-2 border-[#1A1A1A] rounded-md flex flex-col items-center justify-center gap-2 font-bold font-mono transition-all ${
                sessionRan
                  ? 'bg-[#DCFCE7] text-[#166534] border-[#166534] shadow-[3px_3px_0px_0px_#166534] scale-[1.02]'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CheckCircle2 className="w-8 h-8" />
              <span className="text-base">YES, SESSION RAN</span>
            </button>

            <button
              type="button"
              onClick={() => setSessionRan(false)}
              className={`p-4 border-2 border-[#1A1A1A] rounded-md flex flex-col items-center justify-center gap-2 font-bold font-mono transition-all ${
                !sessionRan
                  ? 'bg-[#FEE2E2] text-[#991B1B] border-[#991B1B] shadow-[3px_3px_0px_0px_#991B1B] scale-[1.02]'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <XCircle className="w-8 h-8" />
              <span className="text-base">NO, CANCELLED</span>
            </button>
          </div>

          {/* IF NO: Reason selector */}
          {!sessionRan && (
            <div className="mt-4 pt-4 border-t-2 border-[#1A1A1A] animate-fade-in">
              <label className="block text-xs font-bold font-mono text-[#991B1B] mb-2">
                REASON FOR CANCELLATION:
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  'Power Outage / Solar Inverter Fail',
                  'Teacher / Coordinator Absent',
                  'Lab Door Locked',
                  'School Exams / Assembly',
                  'Equipment Hardware Failure',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setCancellationReason(reason)}
                    className={`p-2 text-xs font-mono border border-[#1A1A1A] rounded text-left transition-colors ${
                      cancellationReason === reason
                        ? 'bg-[#991B1B] text-white font-bold'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type specific reason..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded p-2 text-xs font-mono focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* FIELDS 2 & 3: STUDENTS & ENGAGEMENT (Only if session ran) */}
        {sessionRan && (
          <>
            {/* FIELD 2: STUDENTS PRESENT (NUMBER STEPPER) */}
            <div className="bg-white border-2 border-[#1A1A1A] rounded-md p-5 shadow-[4px_4px_0px_0px_#1A1A1A]">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold font-mono text-[#1A1A1A]">
                  2. STUDENTS PRESENT (STEPPER)
                </label>
                <span className="text-xs font-mono bg-gray-100 border border-gray-400 px-2 py-0.5 rounded text-gray-700">
                  Target: 30 capacity
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 py-2 bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded-md mb-3">
                <button
                  type="button"
                  onClick={() => updateStudents(-1)}
                  className="w-12 h-12 bg-white border-2 border-[#1A1A1A] rounded-md font-bold text-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#1A1A1A] hover:bg-gray-100 active:translate-y-0.5"
                >
                  <Minus className="w-6 h-6 stroke-[3]" />
                </button>

                <div className="text-center px-4">
                  <span className="text-4xl font-extrabold font-mono text-[#1A1A1A]">
                    {studentsPresent}
                  </span>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                    STUDENTS
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateStudents(1)}
                  className="w-12 h-12 bg-white border-2 border-[#1A1A1A] rounded-md font-bold text-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#1A1A1A] hover:bg-gray-100 active:translate-y-0.5"
                >
                  <Plus className="w-6 h-6 stroke-[3]" />
                </button>
              </div>

              {/* Quick Increment Chips */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-mono text-gray-500">Quick add:</span>
                {[-5, +5, +10, 25, 30].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      if (val > 0 && val >= 25) setStudentsPresent(val);
                      else updateStudents(val);
                    }}
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-white border border-[#1A1A1A] rounded hover:bg-[#1D4ED8] hover:text-white transition-colors"
                  >
                    {val > 0 && val < 25 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* FIELD 3: ENGAGEMENT 1-5 TAP SCALE */}
            <div className="bg-white border-2 border-[#1A1A1A] rounded-md p-5 shadow-[4px_4px_0px_0px_#1A1A1A]">
              <label className="block text-sm font-bold font-mono text-[#1A1A1A] mb-3">
                3. STUDENT ENGAGEMENT LEVEL (1–5)
              </label>

              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {[
                  { level: 1, label: 'Very Low', emoji: '😞', color: 'bg-red-100 text-red-900 border-red-800' },
                  { level: 2, label: 'Low', emoji: '😐', color: 'bg-orange-100 text-orange-900 border-orange-800' },
                  { level: 3, label: 'Medium', emoji: '🙂', color: 'bg-amber-100 text-amber-900 border-amber-800' },
                  { level: 4, label: 'High', emoji: '😊', color: 'bg-emerald-100 text-emerald-900 border-emerald-800' },
                  { level: 5, label: 'Exceptional', emoji: '🔥', color: 'bg-blue-100 text-blue-900 border-blue-800' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setEngagementLevel(item.level)}
                    className={`py-3 px-1 border-2 border-[#1A1A1A] rounded-md flex flex-col items-center justify-center transition-all ${
                      engagementLevel === item.level
                        ? `${item.color} font-extrabold shadow-[3px_3px_0px_0px_#1A1A1A] scale-[1.05]`
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl mb-1">{item.emoji}</span>
                    <span className="text-xs font-mono font-bold">{item.level}</span>
                    <span className="text-[10px] font-mono leading-none hidden sm:inline">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* OPTIONAL COLLAPSIBLE: TECHNICAL ISSUES */}
            <div className="bg-white border-2 border-[#1A1A1A] rounded-md shadow-[4px_4px_0px_0px_#1A1A1A] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTechAccordion(!showTechAccordion)}
                className="w-full px-5 py-3 flex items-center justify-between font-mono font-bold text-xs bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
              >
                <span className="flex items-center gap-2 text-[#1A1A1A]">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  TECHNICAL ISSUES (OPTIONAL)
                  {technicalIssues && (
                    <span className="bg-amber-500 text-black px-2 py-0.2 rounded text-[10px]">
                      FLAGGED
                    </span>
                  )}
                </span>
                {showTechAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTechAccordion && (
                <div className="p-4 bg-white border-t border-gray-200 space-y-3">
                  <div>
                    <span className="text-[11px] font-mono text-gray-600 block mb-1">
                      Quick tags:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {quickTechTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTechTag(tag)}
                          className="px-2 py-1 text-[11px] font-mono bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Describe any hardware, Wi-Fi, or app issues encountered..."
                    value={technicalIssues}
                    onChange={(e) => setTechnicalIssues(e.target.value)}
                    className="w-full bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded p-2 text-xs font-mono focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* OPTIONAL COLLAPSIBLE: NOTES & CONTENT */}
            <div className="bg-white border-2 border-[#1A1A1A] rounded-md shadow-[4px_4px_0px_0px_#1A1A1A] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowNotesAccordion(!showNotesAccordion)}
                className="w-full px-5 py-3 flex items-center justify-between font-mono font-bold text-xs bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
              >
                <span className="flex items-center gap-2 text-[#1A1A1A]">
                  <span>📝</span> LESSON CONTENT & NOTES (OPTIONAL)
                </span>
                {showNotesAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showNotesAccordion && (
                <div className="p-4 bg-white border-t border-gray-200 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold font-mono text-gray-700 mb-1">
                      Module / Topic Covered:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Module 4: Digital Circuits & Logic"
                      value={contentCompleted}
                      onChange={(e) => setContentCompleted(e.target.value)}
                      className="w-full bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded p-2 text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold font-mono text-gray-700 mb-1">
                      Coordinator / Teacher Notes:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="General classroom feedback or student highlights..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded p-2 text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="expDay"
                      checked={isExperimentDay}
                      onChange={(e) => setIsExperimentDay(e.target.checked)}
                      className="w-4 h-4 accent-[#1D4ED8]"
                    />
                    <label htmlFor="expDay" className="text-xs font-mono font-bold text-gray-800">
                      Tag as active experiment day (A/B testing active feature)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-[#1D4ED8] text-white border-2 border-[#1A1A1A] rounded-md font-mono font-extrabold text-base tracking-wide shadow-[4px_4px_0px_0px_#1A1A1A] hover:bg-[#1e40af] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#1A1A1A] flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
        >
          <Send className="w-5 h-5" />
          {isSubmitting ? 'SUBMITTING TO LAB PULSE...' : 'SUBMIT DAILY ENTRY (< 60s)'}
        </button>
      </form>

      {/* LAST 3 SUBMISSIONS TRUST FEED */}
      <div className="mt-10 border-t-2 border-[#1A1A1A] pt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1D4ED8]" />
            YOUR LAST 3 SUBMISSIONS
          </h3>
          <span className="text-[11px] text-gray-500 font-mono">
            {assignedSchool?.name}
          </span>
        </div>

        <div className="space-y-3">
          {recentEntries.length === 0 ? (
            <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded text-center text-xs text-gray-500 font-mono">
              No recent entries found for this school. Submit your first entry above!
            </div>
          ) : (
            recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border-2 border-[#1A1A1A] rounded-md p-3 shadow-[2px_2px_0px_0px_#1A1A1A] flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1A1A1A]">{entry.date}</span>
                    {entry.sessionRan ? (
                      <span className="bg-[#DCFCE7] text-[#166534] border border-[#166534] px-1.5 py-0.2 rounded font-bold text-[10px]">
                        RAN • {entry.studentsPresent} STU
                      </span>
                    ) : (
                      <span className="bg-[#FEE2E2] text-[#991B1B] border border-[#991B1B] px-1.5 py-0.2 rounded font-bold text-[10px]">
                        CANCELLED
                      </span>
                    )}
                    {entry.isExperimentDay && (
                      <span className="bg-blue-100 text-blue-800 border border-blue-800 px-1.5 py-0.2 rounded font-bold text-[10px]">
                        EXP DAY
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1 truncate max-w-xs sm:max-w-md">
                    {entry.sessionRan
                      ? `Engagement: ${'★'.repeat(entry.engagementLevel)} (${entry.engagementLevel}/5) ${
                          entry.technicalIssues ? `• Tech: ${entry.technicalIssues}` : ''
                        }`
                      : `Reason: ${entry.technicalIssues || 'Cancelled'}`}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-gray-400 block">SAVED</span>
                  <CheckCircle2 className="w-4 h-4 text-[#166534] inline" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
