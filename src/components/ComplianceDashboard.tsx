import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, Clock, ShieldAlert, FileCheck2, ArrowRight,
  ChevronRight, Activity, ClipboardCheck, Filter, Search
} from 'lucide-react';
import { AppDatabase, NavTab, StatusType } from '../types';

interface ComplianceDashboardProps {
  db: AppDatabase;
  onSelectSheet: (id: NavTab, filterStatus?: StatusType | 'All' | 'OpenDeficiencies') => void;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ db, onSelectSheet }) => {
  const { masterCalendar, deficiencyLog, certificateRegister } = db;
  const [activeMatrixFilter, setActiveMatrixFilter] = useState<'All' | 'Overdue' | 'Due Soon' | 'Current'>('All');

  const currentCount = masterCalendar.filter(m => m.status === 'Current').length;
  const due4DaysCount = masterCalendar.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 4).length;
  const overdueCount = masterCalendar.filter(m => m.status === 'Overdue' || m.daysRemaining < 0).length;
  const openDeficiencies = deficiencyLog.filter(d => d.status === 'Open' || d.status === 'In Progress');
  const certsCritical = certificateRegister.filter(c => c.daysRemaining <= 30 || c.status === 'Critical' || c.status === 'Due Soon');

  // Filtered sheets for quick matrix
  const filteredSheets = masterCalendar.filter(m => {
    if (activeMatrixFilter === 'Overdue') return m.status === 'Overdue' || m.daysRemaining < 0;
    if (activeMatrixFilter === 'Due Soon') return m.status === 'Due Soon' || (m.daysRemaining >= 0 && m.daysRemaining <= 4);
    if (activeMatrixFilter === 'Current') return m.status === 'Current';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Executive Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>R/V KILO MOANA COMPLIANCE DASHBOARD</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Executive Safety & Inspection Overview
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Real-time monitor for 16 shipboard inspection sheets, SMS audit compliance, open deficiencies, and certificate expirations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <button
              onClick={() => onSelectSheet('master-calendar')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-sm transition"
            >
              <span>View Master Calendar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectSheet('binder')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200 transition"
            >
              <span>Monthly Binder</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Clickable Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Inspections */}
        <button
          onClick={() => setActiveMatrixFilter('All')}
          className={`text-left bg-white border rounded-2xl p-4 shadow-sm transition hover:shadow-md hover:scale-[1.02] cursor-pointer ${
            activeMatrixFilter === 'All' ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Tracked</span>
            <FileCheck2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{masterCalendar.length}</div>
          <div className="text-[11px] text-blue-700 font-bold mt-1.5 flex items-center gap-1">
            <span>Show All 16 Sheets</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        {/* Card 2: Current / SAT */}
        <button
          onClick={() => setActiveMatrixFilter('Current')}
          className={`text-left bg-white border rounded-2xl p-4 shadow-sm transition hover:shadow-md hover:scale-[1.02] cursor-pointer ${
            activeMatrixFilter === 'Current' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">Current / SAT</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-2">{currentCount}</div>
          <div className="text-[11px] text-emerald-800 font-bold mt-1.5 flex items-center gap-1">
            <span>Compliant Items</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        {/* Card 3: Due <= 4 Days */}
        <button
          onClick={() => setActiveMatrixFilter('Due Soon')}
          className={`text-left bg-white border rounded-2xl p-4 shadow-sm transition hover:shadow-md hover:scale-[1.02] cursor-pointer ${
            activeMatrixFilter === 'Due Soon' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">Due ≤ 4 Days</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-700 mt-2">{due4DaysCount}</div>
          <div className="text-[11px] text-amber-800 font-bold mt-1.5 flex items-center gap-1">
            <span>Requires Action ({due4DaysCount})</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        {/* Card 4: Overdue */}
        <button
          onClick={() => {
            setActiveMatrixFilter('Overdue');
          }}
          className={`text-left bg-white border rounded-2xl p-4 shadow-sm transition hover:shadow-md hover:scale-[1.02] cursor-pointer ${
            activeMatrixFilter === 'Overdue' ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-rose-700 uppercase tracking-wider">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-700 mt-2">{overdueCount}</div>
          <div className="text-[11px] text-rose-800 font-bold mt-1.5 flex items-center gap-1">
            <span>Click to View Overdue</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        {/* Card 5: Open Deficiencies */}
        <button
          onClick={() => onSelectSheet('deficiency-log')}
          className="text-left bg-white border border-slate-200 rounded-2xl p-4 shadow-sm transition hover:shadow-md hover:scale-[1.02] cursor-pointer col-span-2 sm:col-span-1 hover:border-orange-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-orange-700 uppercase tracking-wider">Open Deficiencies</span>
            <ShieldAlert className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-3xl font-black text-orange-700 mt-2">{openDeficiencies.length}</div>
          <div className="text-[11px] text-orange-800 font-bold mt-1.5 flex items-center gap-1">
            <span>Open Deficiency Log →</span>
          </div>
        </button>
      </div>

      {/* Main Inspection Grid Matrix (All 16 Sheets) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              <span>Master Inspection Sheets Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Click any card to open detailed sheet, or filter by status below</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveMatrixFilter('All')}
              className={`px-3 py-1 rounded-lg transition ${
                activeMatrixFilter === 'All' ? 'bg-white text-blue-700 shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({masterCalendar.length})
            </button>

            <button
              onClick={() => setActiveMatrixFilter('Overdue')}
              className={`px-3 py-1 rounded-lg transition ${
                activeMatrixFilter === 'Overdue' ? 'bg-rose-600 text-white shadow-sm font-extrabold' : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              Overdue ({overdueCount})
            </button>

            <button
              onClick={() => setActiveMatrixFilter('Due Soon')}
              className={`px-3 py-1 rounded-lg transition ${
                activeMatrixFilter === 'Due Soon' ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              Due ≤ 4d ({due4DaysCount})
            </button>

            <button
              onClick={() => setActiveMatrixFilter('Current')}
              className={`px-3 py-1 rounded-lg transition ${
                activeMatrixFilter === 'Current' ? 'bg-emerald-600 text-white shadow-sm font-extrabold' : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              Current ({currentCount})
            </button>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredSheets.length === 0 ? (
            <div className="col-span-full text-center py-8 text-xs text-slate-500 font-medium">
              No inspections match the "{activeMatrixFilter}" status filter.
            </div>
          ) : (
            filteredSheets.map((sheet) => {
              let statusBg = 'bg-emerald-50/80 text-emerald-900 border-emerald-200 hover:border-emerald-300';
              let badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';

              if (sheet.status === 'Overdue' || sheet.daysRemaining < 0) {
                statusBg = 'bg-rose-50/90 text-rose-950 border-rose-200 hover:border-rose-400';
                badgeBg = 'bg-rose-100 text-rose-800 border-rose-300 font-black';
              } else if (sheet.status === 'Due Soon' || sheet.daysRemaining <= 4) {
                statusBg = 'bg-amber-50/90 text-amber-950 border-amber-200 hover:border-amber-400';
                badgeBg = 'bg-amber-100 text-amber-800 border-amber-300 font-black';
              }

              return (
                <div
                  key={sheet.id}
                  onClick={() => onSelectSheet(sheet.id as NavTab)}
                  className={`p-4 rounded-xl border transition cursor-pointer hover:shadow-md hover:scale-[1.01] flex flex-col justify-between gap-3 ${statusBg}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-extrabold text-sm text-slate-900 leading-snug">
                        {sheet.title}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider shrink-0 ${badgeBg}`}>
                        {sheet.daysRemaining < 0 
                          ? `${Math.abs(sheet.daysRemaining)}d OVERDUE` 
                          : sheet.daysRemaining === 0 
                            ? 'DUE TODAY' 
                            : `${sheet.daysRemaining}d left`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-2 font-medium">
                      <span className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-800 font-bold">{sheet.frequency}</span>
                      <span>•</span>
                      <span>{sheet.department}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                    <div>
                      <span className="text-slate-500 font-normal">OIC: </span>
                      <span className="text-slate-900 font-bold">{sheet.mateOic.split('/')[0]}</span>
                    </div>
                    <div className="flex items-center text-blue-600 font-extrabold group-hover:translate-x-0.5 transition">
                      <span>Open Sheet</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Two Column Section: Active Open Deficiencies & Certificate Risk Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Deficiencies Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Active Discrepancies & Work Orders</span>
            </h3>
            <button
              onClick={() => onSelectSheet('deficiency-log')}
              className="text-xs text-blue-600 hover:text-blue-800 font-extrabold"
            >
              Full Deficiency Log →
            </button>
          </div>

          {openDeficiencies.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 font-medium">
              No open deficiencies logged. All equipment SAT!
            </div>
          ) : (
            <div className="space-y-2">
              {openDeficiencies.map((def) => (
                <div key={def.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{def.inspectionTitle}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      def.priority === 'High' || def.priority === 'Critical' 
                        ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {def.priority} Priority
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">{def.deficiency}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pt-1.5 border-t border-slate-200">
                    <span>WO: <strong className="text-slate-900">{def.workOrder || 'Pending'}</strong></span>
                    <span>Assigned: <strong className="text-slate-900">{def.assignedTo}</strong></span>
                    <span>Due: <strong className="text-amber-700">{def.dueDate}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificates Due Soon / Critical */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Vendor Certificates & Expirations</span>
            </h3>
            <button
              onClick={() => onSelectSheet('certificates')}
              className="text-xs text-blue-600 hover:text-blue-800 font-extrabold"
            >
              Certificate Register →
            </button>
          </div>

          <div className="space-y-2">
            {certsCritical.map((cert) => (
              <div key={cert.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900">{cert.certificateSystem}</div>
                  <div className="text-[11px] text-slate-500">{cert.vendor} ({cert.inspector})</div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                    cert.daysRemaining <= 10 
                      ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    Exp: {cert.expirationNextDue} ({cert.daysRemaining}d)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
