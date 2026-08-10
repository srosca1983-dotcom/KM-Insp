import React, { useState } from 'react';
import { BookOpen, Printer, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { AppDatabase, NavTab } from '../types';

interface MonthlyBinderViewProps {
  db: AppDatabase;
  onSelectSheet: (id: NavTab) => void;
  onPrint: () => void;
}

export const MonthlyBinderView: React.FC<MonthlyBinderViewProps> = ({ db, onSelectSheet, onPrint }) => {
  const { masterCalendar, binderSummary, auditLog } = db;
  const [monthStart, setMonthStart] = useState<string>(binderSummary.monthStart || '2026-08-01');

  return (
    <div className="space-y-6">
      {/* Title & Month Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-200/50 print:border-none print:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider print:text-black">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>R/V KILO MOANA MONTHLY SAFETY BINDER</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1 print:text-black">
              Executive Monthly Safety & Audit Binder
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium print:text-gray-600">
              Aggregated monthly compliance binder for vessel Master, Chief Mate, US Coast Guard inspectors, and SMS auditors.
            </p>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold">
              <label className="text-slate-700">Month Start Date:</label>
              <input
                type="date"
                value={monthStart}
                onChange={(e) => setMonthStart(e.target.value)}
                className="bg-white text-blue-700 border border-slate-300 rounded-lg px-2 py-1 font-mono font-bold"
              />
            </div>

            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-sm transition text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Binder</span>
            </button>
          </div>
        </div>
      </div>

      {/* Binder Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 print:grid-cols-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Inspections</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{masterCalendar.length}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
          <div className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Completed This Month</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{binderSummary.completedThisMonth}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
          <div className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">Due Within 4 Days</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{binderSummary.dueWithin4Days}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
          <div className="text-[11px] font-extrabold text-rose-700 uppercase tracking-wider">Overdue</div>
          <div className="text-2xl font-black text-rose-700 mt-1">{binderSummary.overdue}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
          <div className="text-[11px] font-extrabold text-orange-700 uppercase tracking-wider">Open Deficiencies</div>
          <div className="text-2xl font-black text-orange-700 mt-1">{binderSummary.openDeficiencies}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-center shadow-sm">
          <div className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">Certs Due 30 Days</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{binderSummary.certsDue30Days}</div>
        </div>
      </div>

      {/* Complete Monthly Binder Checklist Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print:border-black">
        <div className="p-4 border-b border-slate-200 bg-slate-100">
          <h3 className="text-sm font-black text-slate-900 print:text-black">
            Monthly Inspection Compliance Status Summary ({monthStart})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 border-r border-slate-200">Inspection</th>
                <th className="py-3.5 px-3 border-r border-slate-200">Frequency</th>
                <th className="py-3.5 px-3 border-r border-slate-200">Last Completed</th>
                <th className="py-3.5 px-3 border-r border-slate-200">Next Due</th>
                <th className="py-3.5 px-3 text-center border-r border-slate-200">Compliance Status</th>
                <th className="py-3.5 px-3 border-r border-slate-200">Mate / OIC</th>
                <th className="py-3.5 px-3 text-center">Audit Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {masterCalendar.map((item) => {
                const auditEntry = auditLog.find(a => a.inspectionId === item.id);

                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-black text-slate-900 border-r border-slate-100">
                      <button onClick={() => onSelectSheet(item.id as NavTab)} className="hover:text-blue-600 text-left print:pointer-events-none">
                        {item.title}
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 border-r border-slate-100 font-semibold">{item.frequency}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-700 border-r border-slate-100">{item.lastCompleted || '—'}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 border-r border-slate-100">{item.nextDue || '—'}</td>
                    <td className="py-3.5 px-3 text-center border-r border-slate-100">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                        item.status === 'Current' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : item.status === 'Overdue' 
                          ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 border-r border-slate-100 font-bold">{item.mateOic}</td>
                    <td className="py-3.5 px-3 text-center font-extrabold text-emerald-700">
                      {auditEntry ? auditEntry.auditStatus : 'Open / Pending'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
