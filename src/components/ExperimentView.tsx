import React, { useState, useEffect } from 'react';
import { School, ExperimentWindow, ExperimentComparison } from '../types';
import { FlaskConical, Plus, Calendar, ArrowRight, TrendingUp, CheckCircle, Award } from 'lucide-react';
import { fetchExperiments, createExperimentInFirestore } from '../services/firestoreService';

interface ExperimentViewProps {
  schools: School[];
  authToken: string | null;
  isAdmin: boolean;
}

export const ExperimentView: React.FC<ExperimentViewProps> = ({
  schools,
  authToken,
  isAdmin,
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    schools.length > 0 ? schools[0].id : ''
  );
  const [experiments, setExperiments] = useState<ExperimentWindow[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<string>('');
  const [comparison, setComparison] = useState<ExperimentComparison | null>(null);

  // New experiment form state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newStartDate, setNewStartDate] = useState<string>('');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch experiments & comparison
  const fetchExperimentData = async (schoolId: string, expId?: string) => {
    if (!schoolId) return;
    try {
      const url = `/api/experiments/${schoolId}${expId ? `?experimentId=${expId}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setExperiments(data.experiments || []);
        setComparison(data.comparison || null);
        if (data.experiments.length > 0 && !expId) {
          setSelectedExpId(data.experiments[0].id);
        }
        return;
      }
    } catch (err) {
      console.warn('API experiments fetch failed, fallback to Firestore:', err);
    }

    try {
      const exps = await fetchExperiments(schoolId);
      setExperiments(exps);
      if (exps.length > 0 && !expId) {
        setSelectedExpId(exps[0].id);
      }
    } catch (fsErr) {
      console.error('Firestore experiments fetch failed:', fsErr);
    }
  };

  useEffect(() => {
    if (selectedSchoolId) {
      fetchExperimentData(selectedSchoolId);
    }
  }, [selectedSchoolId]);

  const handleSelectExp = (expId: string) => {
    setSelectedExpId(expId);
    fetchExperimentData(selectedSchoolId, expId);
  };

  const handleCreateExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newStartDate || !newEndDate) {
      alert('Please fill out all required experiment fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          schoolId: selectedSchoolId,
          title: newTitle,
          startDate: newStartDate,
          endDate: newEndDate,
          notes: newNotes,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewTitle('');
        setNewStartDate('');
        setNewEndDate('');
        setNewNotes('');
        fetchExperimentData(selectedSchoolId);
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.warn('API create experiment failed, persisting to Firestore:', err);
    }

    try {
      await createExperimentInFirestore({
        schoolId: selectedSchoolId,
        title: newTitle,
        startDate: newStartDate,
        endDate: newEndDate,
        notes: newNotes || null,
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewStartDate('');
      setNewEndDate('');
      setNewNotes('');
      fetchExperimentData(selectedSchoolId);
    } catch (fsErr) {
      console.error('Firestore create experiment failed:', fsErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-md p-6 shadow-[4px_4px_0px_0px_#1A1A1A] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-[#1D4ED8]" />
            <h2 className="text-xl font-mono font-extrabold text-[#1A1A1A] uppercase">
              EXPERIMENT TRACKER (A/B PRE/POST COMPARISON)
            </h2>
          </div>
          <p className="text-xs text-gray-600 font-mono mt-1">
            Measure product intervention impact by comparing baseline vs experiment window metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* School Selector */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-gray-500 uppercase">
              SCHOOL
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded p-2 text-xs font-mono font-bold"
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* New Experiment Button */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 sm:mt-0 bg-[#1D4ED8] text-white border-2 border-[#1A1A1A] rounded px-3 py-2 text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#1A1A1A] hover:bg-blue-800 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              New Experiment Window
            </button>
          )}
        </div>
      </div>

      {/* Experiment Selector Pills */}
      {experiments.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-mono font-bold text-gray-500">ACTIVE EXPERIMENTS:</span>
          {experiments.map((exp) => (
            <button
              key={exp.id}
              onClick={() => handleSelectExp(exp.id)}
              className={`px-3 py-1.5 border-2 border-[#1A1A1A] rounded text-xs font-mono font-bold whitespace-nowrap transition-all ${
                selectedExpId === exp.id
                  ? 'bg-[#1D4ED8] text-white shadow-[2px_2px_0px_0px_#1A1A1A]'
                  : 'bg-white text-[#1A1A1A] hover:bg-gray-100'
              }`}
            >
              🧪 {exp.title}
            </button>
          ))}
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARISON PANEL */}
      {comparison ? (
        <div className="space-y-6">
          <div className="bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded-md p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#1A1A1A] pb-3 mb-4">
              <div>
                <span className="bg-blue-100 text-blue-800 border border-blue-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                  EXPERIMENT WINDOW DETAILS
                </span>
                <h3 className="text-lg font-mono font-bold text-[#1A1A1A] mt-1">
                  {comparison.experimentWindow.title}
                </h3>
              </div>
              <div className="text-xs font-mono text-gray-700 bg-white border border-[#1A1A1A] px-3 py-1 rounded">
                📅 Window: <strong>{comparison.experimentWindow.startDate}</strong> to{' '}
                <strong>{comparison.experimentWindow.endDate}</strong>
              </div>
            </div>

            {comparison.experimentWindow.notes && (
              <p className="text-xs font-mono text-gray-600 bg-white p-3 rounded border border-gray-300 mb-4">
                <strong>Hypothesis / Notes:</strong> {comparison.experimentWindow.notes}
              </p>
            )}

            {/* SIDE BY SIDE METRICS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BASELINE PERIOD CARD */}
              <div className="bg-white border-2 border-gray-400 rounded-md p-5 shadow-[4px_4px_0px_0px_#9ca3af]">
                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <span className="font-mono font-bold text-xs uppercase text-gray-500">
                    1. BASELINE PERIOD (PRE-TEST)
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">
                    {comparison.baselinePeriod.startDate} to {comparison.baselinePeriod.endDate}
                  </span>
                </div>

                <div className="space-y-4 font-mono">
                  <div>
                    <span className="text-[11px] text-gray-500 block">AVG ATTENDANCE</span>
                    <span className="text-3xl font-extrabold text-gray-800">
                      {comparison.baselinePeriod.avgAttendance}{' '}
                      <span className="text-xs font-normal text-gray-500">students / session</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-500 block">AVG ENGAGEMENT</span>
                      <span className="text-lg font-bold text-gray-700">
                        {comparison.baselinePeriod.avgEngagement} / 5.0
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block">SESSION UPTIME</span>
                      <span className="text-lg font-bold text-gray-700">
                        {comparison.baselinePeriod.sessionUptime}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* EXPERIMENT PERIOD CARD */}
              <div className="bg-white border-2 border-[#1D4ED8] rounded-md p-5 shadow-[4px_4px_0px_0px_#1D4ED8]">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2 mb-3">
                  <span className="font-mono font-bold text-xs uppercase text-[#1D4ED8] flex items-center gap-1">
                    <FlaskConical className="w-3.5 h-3.5" /> 2. EXPERIMENT PERIOD (INTERVENTION)
                  </span>
                  <span className="text-[10px] font-mono text-blue-700 font-bold">
                    {comparison.experimentPeriod.startDate} to {comparison.experimentPeriod.endDate}
                  </span>
                </div>

                <div className="space-y-4 font-mono">
                  <div>
                    <span className="text-[11px] text-gray-500 block">AVG ATTENDANCE</span>
                    <span className="text-3xl font-extrabold text-[#1D4ED8]">
                      {comparison.experimentPeriod.avgAttendance}{' '}
                      <span className="text-xs font-normal text-gray-500">students / session</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-100">
                    <div>
                      <span className="text-[10px] text-gray-500 block">AVG ENGAGEMENT</span>
                      <span className="text-lg font-bold text-[#1D4ED8]">
                        {comparison.experimentPeriod.avgEngagement} / 5.0
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block">SESSION UPTIME</span>
                      <span className="text-lg font-bold text-[#1D4ED8]">
                        {comparison.experimentPeriod.sessionUptime}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CALCULATED LIFT SUMMARY */}
            <div className="mt-6 bg-[#DCFCE7] border-2 border-[#166534] rounded-md p-5 shadow-[4px_4px_0px_0px_#166534]">
              <h4 className="font-mono font-extrabold text-sm text-[#166534] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#166534]" />
                CALCULATED EXPERIMENTAL LIFT / DELTA
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-mono">
                <div className="bg-white border border-[#166534] rounded p-3">
                  <span className="text-[10px] text-gray-600 block uppercase">ATTENDANCE LIFT</span>
                  <span
                    className={`text-2xl font-extrabold ${
                      comparison.lift.attendanceDelta >= 0 ? 'text-[#166534]' : 'text-red-700'
                    }`}
                  >
                    {comparison.lift.attendanceDelta > 0 ? `+${comparison.lift.attendanceDelta}` : comparison.lift.attendanceDelta}
                  </span>
                  <span className="text-[10px] text-gray-500 block">students / session</span>
                </div>

                <div className="bg-white border border-[#166534] rounded p-3">
                  <span className="text-[10px] text-gray-600 block uppercase">ENGAGEMENT LIFT</span>
                  <span
                    className={`text-2xl font-extrabold ${
                      comparison.lift.engagementDelta >= 0 ? 'text-[#166534]' : 'text-red-700'
                    }`}
                  >
                    {comparison.lift.engagementDelta > 0 ? `+${comparison.lift.engagementDelta}` : comparison.lift.engagementDelta}
                  </span>
                  <span className="text-[10px] text-gray-500 block">points (scale 1-5)</span>
                </div>

                <div className="bg-white border border-[#166534] rounded p-3">
                  <span className="text-[10px] text-gray-600 block uppercase">SESSION UPTIME LIFT</span>
                  <span
                    className={`text-2xl font-extrabold ${
                      comparison.lift.uptimeDelta >= 0 ? 'text-[#166534]' : 'text-red-700'
                    }`}
                  >
                    {comparison.lift.uptimeDelta > 0 ? `+${comparison.lift.uptimeDelta}%` : `${comparison.lift.uptimeDelta}%`}
                  </span>
                  <span className="text-[10px] text-gray-500 block">uptime percentage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white border-2 border-[#1A1A1A] rounded-md text-center font-mono">
          <p className="text-gray-600 text-sm">
            No experiment windows created for {selectedSchool?.name} yet.
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 bg-[#1D4ED8] text-white px-4 py-2 border-2 border-[#1A1A1A] rounded text-xs font-bold shadow-[2px_2px_0px_0px_#1A1A1A]"
            >
              + Create First Experiment Window
            </button>
          )}
        </div>
      )}

      {/* CREATE EXPERIMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#1A1A1A] rounded-md max-w-md w-full p-6 shadow-[8px_8px_0px_0px_#1A1A1A] space-y-4">
            <h3 className="text-lg font-mono font-extrabold text-[#1A1A1A] uppercase border-b-2 border-[#1A1A1A] pb-2">
              CREATE EXPERIMENT WINDOW
            </h3>

            <form onSubmit={handleCreateExperiment} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block font-bold mb-1">SCHOOL:</label>
                <div className="p-2 bg-[#F7F5F0] border border-[#1A1A1A] rounded font-bold">
                  {selectedSchool?.name}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">EXPERIMENT TITLE / FEATURE:</label>
                <input
                  type="text"
                  placeholder="e.g. Gamified Math v2.1 Test"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#1A1A1A] rounded p-2 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">START DATE:</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#1A1A1A] rounded p-2 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">END DATE:</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#1A1A1A] rounded p-2 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">HYPOTHESIS / NOTES:</label>
                <textarea
                  rows={2}
                  placeholder="Expected impact or feature flag description..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#1A1A1A] rounded p-2 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-gray-400 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[#1D4ED8] text-white border border-[#1A1A1A] rounded font-bold shadow-[2px_2px_0px_0px_#1A1A1A]"
                >
                  {isSubmitting ? 'Saving...' : 'Save Window'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
