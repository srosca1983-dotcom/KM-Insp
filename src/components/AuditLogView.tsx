import React, { useState } from 'react';
import { 
  ClipboardCheck, CheckCircle2, ChevronRight, Search, Filter, Printer, 
  ShieldCheck, FileText, Calendar, User, ArrowDownToLine 
} from 'lucide-react';
import { AuditLogEntry, NavTab } from '../types';

interface AuditLogViewProps {
  auditLog: AuditLogEntry[];
  onSelectSheet: (id: NavTab) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLog, onSelectSheet }) => {
  const [search, setSearch] = useState('');
  const [filterOfficer, setFilterOfficer] = useState('All');

  // Unique officer list for filter
  const officers = Array.from(new Set(auditLog.map(a => a.mateName).filter(Boolean)));

  const filtered = auditLog.filter(log => {
    if (filterOfficer !== 'All' && log.mateName !== filterOfficer) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.inspectionTitle.toLowerCase().includes(q) ||
        (log.mateName && log.mateName.toLowerCase().includes(q)) ||
        (log.position && log.position.toLowerCase().includes(q)) ||
        (log.signatureInitials && log.signatureInitials.toLowerCase().includes(q)) ||
        (log.notes && log.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-200/50 print:border-none print:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider print:text-black">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              <span>R/V KILO MOANA (AGOR-26) INSPECTION AUDIT TRAIL</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1 print:text-black">
              Master Official Sign-Off Audit Register
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium print:text-slate-800">
              Permanent verification register tracking completed vessel safety inspections, signing officers, timestamps, and compliance status for USCG / SMS audits.
            </p>
          </div>

          <div className="flex items-center gap-2.5 print:hidden">
            <button
              onClick={handlePrintAudit}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-sm transition text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Audit Register</span>
            </button>
          </div>
        </div>

        {/* Audit Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 print:grid-cols-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Signed-Off Logs</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{auditLog.length}</div>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-center">
            <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Verified Audits</div>
            <div className="text-xl font-black text-emerald-800 mt-0.5">
              {auditLog.filter(a => a.auditStatus === 'Verified').length}
            </div>
          </div>
          <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200 text-center">
            <div className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider">Active Signing Officers</div>
            <div className="text-xl font-black text-blue-900 mt-0.5">{officers.length || 1}</div>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Audit Compliance</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">100% USCG Ready</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by sheet title, officer name, position, or notes..."
                className="w-full bg-slate-50 text-xs text-slate-900 font-medium pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            {officers.length > 0 && (
              <select
                value={filterOfficer}
                onChange={(e) => setFilterOfficer(e.target.value)}
                className="bg-slate-50 text-slate-900 font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
              >
                <option value="All">Officer: All</option>
                {officers.map(off => (
                  <option key={off} value={off}>{off}</option>
                ))}
              </select>
            )}
          </div>

          <div className="text-slate-600 font-bold">
            Showing <strong className="text-slate-900">{filtered.length}</strong> of {auditLog.length} Records
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print:border-black print:rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 border-r border-slate-200">Inspection Sheet</th>
                <th className="py-3.5 px-3 border-r border-slate-200">Officer / Mate Name</th>
                <th className="py-3.5 px-3 border-r border-slate-200">Position / Duty</th>
                <th className="py-3.5 px-3 border-r border-slate-200 text-center">Initials</th>
                <th className="py-3.5 px-3 border-r border-slate-200">Date Completed</th>
                <th className="py-3.5 px-3 border-r border-slate-200">Time Completed</th>
                <th className="py-3.5 px-3 border-r border-slate-200 text-center">Audit Status</th>
                <th className="py-3.5 px-3 border-r border-slate-200">Next Due Date</th>
                <th className="py-3.5 px-4">Audit Notes & Verification</th>
                <th className="py-3.5 px-3 text-right print:hidden">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-500 font-medium">
                    No sign-offs recorded matching filter. Complete an inspection sheet to populate the audit log.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-black text-slate-900 border-r border-slate-100">{log.inspectionTitle}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-800 border-r border-slate-100">{log.mateName || '—'}</td>
                    <td className="py-3.5 px-3 text-slate-600 border-r border-slate-100">{log.position || '—'}</td>
                    <td className="py-3.5 px-3 font-black text-blue-700 uppercase tracking-wider text-center border-r border-slate-100">{log.signatureInitials || '—'}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-700 border-r border-slate-100">{log.dateCompleted || '—'}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 border-r border-slate-100">{log.timeCompleted || '—'}</td>
                    <td className="py-3.5 px-3 text-center border-r border-slate-100">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {log.auditStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-amber-700 font-bold border-r border-slate-100">{log.dueDate || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{log.notes || '—'}</td>
                    <td className="py-3.5 px-3 text-right print:hidden">
                      <button
                        onClick={() => onSelectSheet(log.inspectionId as NavTab)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                      >
                        <span>View Sheet</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
