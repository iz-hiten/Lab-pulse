import React, { useState } from 'react';
import { SchoolHealthSummary, AlertItem, DailyEntry } from '../types';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Calendar,
  Users,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Zap,
  Download,
  Building2,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceArea,
} from 'recharts';

interface AdminDashboardProps {
  summaries: SchoolHealthSummary[];
  alerts: AlertItem[];
  onSelectSchoolForDrilldown: (schoolId: string) => void;
  selectedSchoolSummary: (SchoolHealthSummary & { entries: DailyEntry[] }) | null;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  summaries,
  alerts,
  onSelectSchoolForDrilldown,
  selectedSchoolSummary,
  onRefreshData,
}) => {
  const [showExperimentOverlay, setShowExperimentOverlay] = useState<boolean>(true);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [techFilterOnly, setTechFilterOnly] = useState<boolean>(false);

  // Overall Program Aggregates
  const totalSchools = summaries.length;
  const avgProgramHealth = totalSchools
    ? Math.round(summaries.reduce((acc, s) => acc + s.healthScore, 0) / totalSchools)
    : 0;
  const totalWeeklyStudents = summaries.reduce(
    (acc, s) => acc + Math.round(s.trailingStats.avgStudentsPresent * s.trailingStats.totalEntries),
    0
  );
  const totalAlertsCount = alerts.length;

  // Status styling helpers
  const getStatusBadge = (score: number) => {
    if (score >= 80)
      return {
        label: 'HEALTHY',
        bg: 'bg-[#DCFCE7]',
        text: 'text-[#15803D]',
        border: 'border-[#166534]',
      };
    if (score >= 60)
      return {
        label: 'NEEDS ATTENTION',
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#B45309]',
        border: 'border-[#92400E]',
      };
    return {
      label: 'CRITICAL RISK',
      bg: 'bg-[#FEE2E2]',
      text: 'text-[#B91C1C]',
      border: 'border-[#991B1B]',
    };
  };

  // Filter raw entries for drill-down table
  const filteredEntries =
    selectedSchoolSummary?.entries.filter((entry) => {
      const matchesSearch =
        !tableSearch ||
        entry.date.includes(tableSearch) ||
        (entry.technicalIssues && entry.technicalIssues.toLowerCase().includes(tableSearch.toLowerCase())) ||
        (entry.contentCompleted && entry.contentCompleted.toLowerCase().includes(tableSearch.toLowerCase()));

      const matchesTech = !techFilterOnly || Boolean(entry.technicalIssues);

      return matchesSearch && matchesTech;
    }) || [];

  // Export CSV Helper
  const handleExportCSV = () => {
    if (!selectedSchoolSummary) return;
    const headers = ['Date', 'Session Ran', 'Duration (Mins)', 'Students Present', 'Engagement (1-5)', 'Lesson Content', 'Technical Issues', 'Notes'];
    const rows = filteredEntries.map((e) => [
      e.date,
      e.sessionRan ? 'YES' : 'NO',
      e.sessionDurationMins || 0,
      e.studentsPresent,
      e.engagementLevel,
      `"${(e.contentCompleted || '').replace(/"/g, '""')}"`,
      `"${(e.technicalIssues || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `labpulse_${selectedSchoolSummary.school.name.toLowerCase().replace(/\s+/g, '_')}_entries.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare chart data for drill-down
  const chartData =
    selectedSchoolSummary?.entries
      .slice()
      .reverse()
      .map((e) => ({
        date: e.date.substring(5), // MM-DD
        fullDate: e.date,
        students: e.studentsPresent,
        engagement: e.engagementLevel,
        sessionRan: e.sessionRan ? 1 : 0,
        isExp: e.isExperimentDay,
        hasTechIssue: Boolean(e.technicalIssues),
      })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* EXECUTIVE KPI SUMMARY RIBBON */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded-md shadow-[4px_4px_0px_0px_#1A1A1A] space-y-1">
          <div className="flex items-center justify-between font-mono text-xs text-gray-500 font-bold">
            <span>PARTNER SCHOOLS</span>
            <Building2 className="w-4 h-4 text-[#1D4ED8]" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#1A1A1A]">
            {totalSchools} <span className="text-xs font-normal text-gray-500">Active Labs</span>
          </div>
          <p className="text-[10px] font-mono text-gray-600">Daily field reports connected</p>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded-md shadow-[4px_4px_0px_0px_#1A1A1A] space-y-1">
          <div className="flex items-center justify-between font-mono text-xs text-gray-500 font-bold">
            <span>PROGRAM HEALTH</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#1A1A1A]">
            {avgProgramHealth} <span className="text-xs font-normal text-gray-500">/ 100 Index</span>
          </div>
          <p className="text-[10px] font-mono text-emerald-700 font-bold">Weighted program composite</p>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded-md shadow-[4px_4px_0px_0px_#1A1A1A] space-y-1">
          <div className="flex items-center justify-between font-mono text-xs text-gray-500 font-bold">
            <span>WEEKLY ATTENDANCE</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#1A1A1A]">
            {totalWeeklyStudents} <span className="text-xs font-normal text-gray-500">Student Logs</span>
          </div>
          <p className="text-[10px] font-mono text-gray-600">14-day cumulative count</p>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded-md shadow-[4px_4px_0px_0px_#1A1A1A] space-y-1">
          <div className="flex items-center justify-between font-mono text-xs text-gray-500 font-bold">
            <span>ACTIVE ALERTS</span>
            <AlertTriangle className={`w-4 h-4 ${totalAlertsCount > 0 ? 'text-red-600 animate-pulse' : 'text-gray-400'}`} />
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#1A1A1A]">
            {totalAlertsCount} <span className="text-xs font-normal text-gray-500">Flagged</span>
          </div>
          <p className={`text-[10px] font-mono font-bold ${totalAlertsCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
            {totalAlertsCount > 0 ? 'Requires field manager review' : 'All systems normal'}
          </p>
        </div>

      </div>

      {/* ABOVE THE FOLD ALERTS PANEL */}
      <div className="bg-[#FEF2F2] border-2 border-[#991B1B] rounded-md p-5 shadow-[4px_4px_0px_0px_#991B1B]">
        <div className="flex items-center justify-between border-b-2 border-[#991B1B] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-[#991B1B] stroke-[2.5] animate-pulse" />
            <h2 className="text-base sm:text-lg font-mono font-extrabold text-[#991B1B] tracking-tight uppercase">
              HIGH-PRIORITY FIELD ALERTS ({alerts.length})
            </h2>
          </div>
          <span className="text-xs font-mono font-bold bg-[#991B1B] text-white px-2.5 py-1 rounded">
            AUTO-FLAGGED ANOMALIES
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="flex items-center gap-2 text-xs font-mono text-[#166534] bg-[#DCFCE7] p-3 rounded border border-[#166534]">
            <CheckCircle2 className="w-4 h-4" />
            <span>All schools operating within normal performance thresholds. No active alerts.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => onSelectSchoolForDrilldown(alert.schoolId)}
                className="bg-white border-2 border-[#991B1B] rounded p-3 shadow-[2px_2px_0px_0px_#991B1B] hover:translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs text-[#991B1B] uppercase truncate max-w-[180px]">
                    {alert.schoolName}
                  </span>
                  <span className="bg-[#FEE2E2] text-[#991B1B] text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border border-[#991B1B]">
                    {alert.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#1A1A1A] font-medium leading-snug">
                  {alert.message}
                </p>
                <div className="mt-2 text-[10px] font-mono text-[#991B1B] font-bold flex items-center gap-1">
                  Click to inspect school drill-down <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PER-SCHOOL HEALTH SCORE CARDS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-mono font-bold text-[#1A1A1A] uppercase tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1D4ED8]" />
              FIELD HEALTH SCORES (TRAILING 7 DAYS)
            </h2>
            <p className="text-xs text-gray-600 font-mono">
              Weighted average of session uptime (40%), attendance rate (30%), and student engagement (30%)
            </p>
          </div>
          <button
            onClick={onRefreshData}
            className="text-xs font-mono font-bold bg-white border-2 border-[#1A1A1A] px-3 py-1.5 rounded shadow-[2px_2px_0px_0px_#1A1A1A] hover:bg-gray-100"
          >
            ↻ Refresh Real-Time
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaries.map((s) => {
            const badge = getStatusBadge(s.healthScore);
            const isSelected = selectedSchoolSummary?.school.id === s.school.id;

            return (
              <div
                key={s.school.id}
                onClick={() => onSelectSchoolForDrilldown(s.school.id)}
                className={`bg-white border-2 border-[#1A1A1A] rounded-md p-5 shadow-[4px_4px_0px_0px_#1A1A1A] transition-all cursor-pointer relative ${
                  isSelected ? 'ring-4 ring-[#1D4ED8] bg-blue-50/20' : 'hover:scale-[1.01]'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 border-b-2 border-[#1A1A1A] pb-3 mb-3">
                  <div>
                    <h3 className="font-bold text-base text-[#1A1A1A] leading-tight font-mono">
                      {s.school.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                      Commute: {s.school.commuteTime}m • Dedicated Staff:{' '}
                      {s.school.hasDedicatedStaff ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border} flex-shrink-0`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Score & Trend Display */}
                <div className="flex items-center justify-between mb-4 bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded p-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gray-500 block uppercase">
                      HEALTH SCORE
                    </span>
                    <div className="text-4xl font-extrabold font-mono text-[#1A1A1A] leading-none mt-1">
                      {s.healthScore}
                      <span className="text-lg text-gray-400">/100</span>
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-gray-500 block uppercase">
                      VS PRIOR 7D
                    </span>
                    <div
                      className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-1 rounded border mt-1 ${
                        s.trend === 'up'
                          ? 'bg-[#DCFCE7] text-[#166534] border-[#166534]'
                          : s.trend === 'down'
                          ? 'bg-[#FEE2E2] text-[#991B1B] border-[#991B1B]'
                          : 'bg-gray-200 text-gray-700 border-gray-400'
                      }`}
                    >
                      {s.trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                      {s.trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                      {s.trend === 'flat' && <Minus className="w-3.5 h-3.5" />}
                      <span>
                        {s.trendDelta > 0 ? `+${s.trendDelta}` : s.trendDelta} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trailing metrics row */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono border-t border-gray-200 pt-3">
                  <div>
                    <span className="text-[10px] text-gray-500 block">UPTIME</span>
                    <span className="font-bold text-[#1A1A1A]">
                      {Math.round(s.trailingStats.sessionUptime)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 block">ATTENDANCE</span>
                    <span className="font-bold text-[#1A1A1A]">
                      {Math.round(s.trailingStats.avgStudentsPresent)} / ses
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 block">ENGAGEMENT</span>
                    <span className="font-bold text-[#1A1A1A]">
                      {s.trailingStats.avgEngagement.toFixed(1)} / 5
                    </span>
                  </div>
                </div>

                {/* Active Alerts Banner on Card */}
                {s.alerts.length > 0 && (
                  <div className="mt-3 pt-2 border-t-2 border-red-300 bg-red-50 p-2 rounded text-[11px] font-mono text-red-900 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
                      {s.alerts.length} Active Alert{s.alerts.length > 1 ? 's' : ''}
                    </span>
                    <span className="underline">Inspect →</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* DRILL-DOWN PER SCHOOL VIEW */}
      {selectedSchoolSummary && (
        <div className="bg-white border-2 border-[#1A1A1A] rounded-md p-6 shadow-[6px_6px_0px_0px_#1A1A1A] space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1A1A1A] pb-4">
            <div>
              <span className="text-xs font-mono bg-[#1D4ED8] text-white px-2 py-0.5 rounded font-bold uppercase">
                SCHOOL DRILL-DOWN ANALYTICS
              </span>
              <h3 className="text-2xl font-extrabold font-mono text-[#1A1A1A] mt-1">
                {selectedSchoolSummary.school.name}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-mono font-bold bg-[#F7F5F0] border border-[#1A1A1A] px-3 py-1.5 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={showExperimentOverlay}
                  onChange={(e) => setShowExperimentOverlay(e.target.checked)}
                  className="accent-[#1D4ED8]"
                />
                Overlay Experiment Days Shading
              </label>

              <button
                onClick={handleExportCSV}
                className="bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] px-3 py-1.5 rounded font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#1A1A1A] hover:bg-gray-800 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                Export CSV
              </button>
            </div>
          </div>

          {/* DRILL-DOWN RECHARTS LINE / BAR CHART */}
          <div className="bg-[#F7F5F0] border-2 border-[#1A1A1A] rounded-md p-4">
            <h4 className="text-xs font-mono font-bold uppercase text-gray-700 mb-2 flex items-center justify-between">
              <span>ATTENDANCE (BARS) &amp; ENGAGEMENT (LINE) OVER TIME</span>
              <span className="text-[10px] text-gray-500">Trailing 14 Days</span>
            </h4>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    domain={[0, 35]}
                    tick={{ fontSize: 11, fontFamily: 'monospace' }}
                    label={{ value: 'Students', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 5]}
                    ticks={[0, 1, 2, 3, 4, 5]}
                    tick={{ fontSize: 11, fontFamily: 'monospace' }}
                    label={{ value: 'Engagement (1-5)', angle: 90, position: 'insideRight', style: { fontSize: 10 } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      color: '#ffffff',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />

                  {/* Experiment Day Overlay Shading */}
                  {showExperimentOverlay &&
                    chartData
                      .filter((d) => d.isExp)
                      .map((d, i) => (
                        <ReferenceArea
                          key={i}
                          yAxisId="left"
                          x1={d.date}
                          x2={d.date}
                          stroke="none"
                          fill="#3B82F6"
                          fillOpacity={0.25}
                        />
                      ))}

                  <Bar
                    yAxisId="left"
                    dataKey="students"
                    name="Students Present"
                    fill="#1D4ED8"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="engagement"
                    name="Engagement Level (1-5)"
                    stroke="#D97706"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#D97706', strokeWidth: 2, stroke: '#ffffff' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RAW ENTRIES DATA TABLE WITH FILTERS */}
          <div className="border-t-2 border-[#1A1A1A] pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h4 className="text-sm font-mono font-bold text-[#1A1A1A] uppercase tracking-wider">
                RAW FIELD ENTRIES TABLE ({filteredEntries.length})
              </h4>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search entries or date..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="pl-8 pr-3 py-1 bg-[#F7F5F0] border border-[#1A1A1A] rounded text-xs font-mono focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setTechFilterOnly(!techFilterOnly)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold border border-[#1A1A1A] rounded flex items-center gap-1 ${
                    techFilterOnly ? 'bg-amber-500 text-black' : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  Tech Issues Only
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border-2 border-[#1A1A1A] rounded-md">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-[#1A1A1A] text-white">
                    <th className="p-2.5 border-b border-[#1A1A1A]">DATE</th>
                    <th className="p-2.5 border-b border-[#1A1A1A]">SESSION STATUS</th>
                    <th className="p-2.5 border-b border-[#1A1A1A]">STUDENTS</th>
                    <th className="p-2.5 border-b border-[#1A1A1A]">ENGAGEMENT</th>
                    <th className="p-2.5 border-b border-[#1A1A1A]">LESSON CONTENT</th>
                    <th className="p-2.5 border-b border-[#1A1A1A]">TECHNICAL ISSUES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="p-2.5 font-bold whitespace-nowrap">{entry.date}</td>
                      <td className="p-2.5 whitespace-nowrap">
                        {entry.sessionRan ? (
                          <span className="bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded font-bold border border-[#166534]">
                            RAN (45m)
                          </span>
                        ) : (
                          <span className="bg-[#FEE2E2] text-[#991B1B] px-2 py-0.5 rounded font-bold border border-[#991B1B]">
                            CANCELLED
                          </span>
                        )}
                        {entry.isExperimentDay && (
                          <span className="ml-1 bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            EXP
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-extrabold">{entry.studentsPresent}</td>
                      <td className="p-2.5 font-bold text-[#D97706]">
                        {entry.sessionRan ? `${entry.engagementLevel} / 5` : '-'}
                      </td>
                      <td className="p-2.5 text-gray-700 max-w-xs truncate">
                        {entry.contentCompleted || '-'}
                      </td>
                      <td className="p-2.5 max-w-xs">
                        {entry.technicalIssues ? (
                          <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 font-semibold block truncate">
                            ⚠️ {entry.technicalIssues}
                          </span>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
