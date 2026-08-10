import React, { useState } from 'react';
import { Calendar, Filter, Search, ChevronRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { InspectionMeta, NavTab } from '../types';

interface MasterCalendarViewProps {
  masterCalendar: InspectionMeta[];
  onSelectSheet: (id: NavTab) => void;
  initialFilterStatus?: string;
}

export const MasterCalendarView: React.FC<MasterCalendarViewProps> = ({ 
  masterCalendar, 
  onSelectSheet,
  initialFilterStatus = 'All' 
}) => {
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterFreq, setFilterFreq] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>(initialFilterStatus);
  const [search, setSearch] = useState<string>('');

  const departments = ['All', ...Array.from(new Set(masterCalendar.map(m => m.department)))];
  const frequencies = ['All', 'Daily', 'Weekly', 'Monthly'];
  const statuses = ['All', 'Current', 'Due Soon', 'Overdue'];

  const filtered = masterCalendar.filter((item) => {
    if (filterDept !== 'All' && item.department !== filterDept) return false;
    if (filterFreq !== 'All' && item.frequency !== filterFreq) return false;
    if (filterStatus !== 'All' && item.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.regBasis.toLowerCase().includes(q) ||
        item.mateOic.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Filter Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>R/V KILO MOANA MASTER INSPECTION CALENDAR</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Master SMS Inspection Calendar & Frequency Tracker
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Click any inspection row to jump to its interactive check sheet. Completion dates and next due dates synchronize automatically across all shipboard devices.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
            Total Tracked: <strong className="text-blue-700 font-black">{masterCalendar.length} Inspections</strong>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters:</span>
          </div>

          {/* Dept Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-slate-50 text-slate-900 font-semibold border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
          >
            <option value="All">Dept: All</option>
            {departments.filter(d => d !== 'All').map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Frequency Filter */}
          <select
            value={filterFreq}
            onChange={(e) => setFilterFreq(e.target.value)}
            className="bg-slate-50 text-slate-900 font-semibold border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
          >
            <option value="All">Frequency: All</option>
            {frequencies.filter(f => f !== 'All').map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 text-slate-900 font-semibold border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
          >
            <option value="All">Status: All</option>
            {statuses.filter(s => s !== 'All').map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Quick Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search calendar..."
              className="w-full bg-slate-50 text-xs text-slate-900 font-medium pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          {(filterDept !== 'All' || filterFreq !== 'All' || filterStatus !== 'All' || search) && (
            <button
              onClick={() => {
                setFilterDept('All');
                setFilterFreq('All');
                setFilterStatus('All');
                setSearch('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Master Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Inspection Tab</th>
                <th className="py-3.5 px-3">Freq.</th>
                <th className="py-3.5 px-3">Resp. Dept</th>
                <th className="py-3.5 px-4">Reg / SMS Basis</th>
                <th className="py-3.5 px-3">Last Completed</th>
                <th className="py-3.5 px-3">Next Due</th>
                <th className="py-3.5 px-3">Days Left</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3">Mate / OIC</th>
                <th className="py-3.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-500 font-medium">
                    No inspections match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Current
                    </span>
                  );

                  if (item.status === 'Overdue' || item.daysRemaining < 0) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                        <AlertTriangle className="w-3 h-3 text-rose-700" /> Overdue
                      </span>
                    );
                  } else if (item.status === 'Due Soon' || item.daysRemaining <= 4) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-700" /> Due Soon
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectSheet(item.id as NavTab)}
                      className="hover:bg-slate-50/90 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-black text-slate-900 group-hover:text-blue-600">
                        {item.title}
                        {item.openDeficienciesCount > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] border border-amber-300 font-bold">
                            {item.openDeficienciesCount} def
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-700">{item.frequency}</td>
                      <td className="py-3.5 px-3 text-slate-600">{item.department}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={item.regBasis}>
                        {item.regBasis}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-700">{item.lastCompleted || '—'}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{item.nextDue || '—'}</td>
                      <td className="py-3.5 px-3 font-mono font-extrabold">
                        <span className={item.daysRemaining < 0 ? 'text-rose-600 font-black' : item.daysRemaining <= 4 ? 'text-amber-600 font-black' : 'text-slate-700'}>
                          {item.daysRemaining < 0 ? `${item.daysRemaining}d` : `${item.daysRemaining}d`}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">{statusBadge}</td>
                      <td className="py-3.5 px-3 text-slate-700 font-semibold">{item.mateOic}</td>
                      <td className="py-3.5 px-3 text-right">
                        <button className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-800">
                          <span>Open Sheet</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
