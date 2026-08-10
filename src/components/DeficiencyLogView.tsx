import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, Filter, Sparkles, CheckCircle2, Trash2, Edit } from 'lucide-react';
import { DeficiencyItem, NavTab } from '../types';
import { api } from '../services/api';

interface DeficiencyLogViewProps {
  deficiencies: DeficiencyItem[];
  onSaveDeficiency: (deficiency: DeficiencyItem) => void;
  onDeleteDeficiency: (id: string) => void;
  onSelectSheet: (id: NavTab) => void;
}

export const DeficiencyLogView: React.FC<DeficiencyLogViewProps> = ({
  deficiencies,
  onSaveDeficiency,
  onDeleteDeficiency,
  onSelectSheet,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const [modalOpen, setDropdownModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  const [form, setForm] = useState<Partial<DeficiencyItem>>({
    id: '',
    dateFound: new Date().toISOString().substring(0, 10),
    inspectionId: 'rescue-boat',
    inspectionTitle: 'Rescue Boat Monthly',
    deficiency: '',
    priority: 'Medium',
    workOrder: '',
    assignedTo: '3rd Mate / Deck Dept',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
    dateCorrected: '',
    verifiedBy: '',
    status: 'Open',
    notes: '',
    initials: '',
  });

  const filtered = deficiencies.filter(d => {
    if (filterStatus !== 'All' && d.status !== filterStatus) return false;
    if (filterPriority !== 'All' && d.priority !== filterPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        d.deficiency.toLowerCase().includes(q) ||
        d.inspectionTitle.toLowerCase().includes(q) ||
        d.workOrder.toLowerCase().includes(q) ||
        d.assignedTo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleEdit = (item: DeficiencyItem) => {
    setForm(item);
    setDropdownModalOpen(true);
  };

  const handleCreateNew = () => {
    setForm({
      id: '',
      dateFound: new Date().toISOString().substring(0, 10),
      inspectionId: 'rescue-boat',
      inspectionTitle: 'Rescue Boat Monthly',
      deficiency: '',
      priority: 'Medium',
      workOrder: `WO-${Math.floor(88000 + Math.random() * 1000)}`,
      assignedTo: '3rd Mate / Deck Dept',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      dateCorrected: '',
      verifiedBy: '',
      status: 'Open',
      notes: '',
      initials: '',
    });
    setAiSuggestion(null);
    setDropdownModalOpen(true);
  };

  const handleAiAnalyze = async () => {
    if (!form.deficiency) return;
    setAiLoading(true);
    try {
      const res = await api.analyzeDeficiency(form.deficiency, form.inspectionTitle || '', 'Shipboard Equipment');
      setAiSuggestion(res);
      setForm(prev => ({
        ...prev,
        priority: res.priority || prev.priority,
        notes: res.recommendation ? `${prev.notes ? prev.notes + '\n\n' : ''}AI Rec: ${res.recommendation}` : prev.notes,
        workOrder: prev.workOrder || res.workOrderSuggestion || `WO-${Math.floor(88000 + Math.random() * 1000)}`,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.deficiency) return;
    onSaveDeficiency(form as DeficiencyItem);
    setDropdownModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-amber-700 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>INSPECTION DEFICIENCY LOG & WORK ORDER TRACKER</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Deficiency Log & Discrepancy Closeout
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Formal tracker for discrepancies, work orders, department assignments, due dates, and verification closeouts.
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Deficiency</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            <span>Filters:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 text-slate-900 font-semibold border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-600"
          >
            <option value="All">Status: All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-50 text-slate-900 font-semibold border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-600"
          >
            <option value="All">Priority: All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deficiencies or work orders..."
              className="w-full bg-slate-50 text-xs text-slate-900 font-medium pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-3">Date Found</th>
                <th className="py-3.5 px-4">Inspection</th>
                <th className="py-3.5 px-5">Deficiency / Condition Found</th>
                <th className="py-3.5 px-3">Priority</th>
                <th className="py-3.5 px-3">Work Order</th>
                <th className="py-3.5 px-3">Assigned To</th>
                <th className="py-3.5 px-3">Due Date</th>
                <th className="py-3.5 px-3">Date Corrected</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-500 font-medium">
                    No deficiency records match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-3 font-mono text-slate-600">{d.dateFound}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      <button
                        onClick={() => onSelectSheet(d.inspectionId as NavTab)}
                        className="hover:text-blue-600 hover:underline text-left"
                      >
                        {d.inspectionTitle}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-slate-800 max-w-sm font-medium">
                      {d.deficiency}
                      {d.notes && <div className="text-[10px] text-slate-500 italic mt-0.5">{d.notes}</div>}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                        d.priority === 'High' || d.priority === 'Critical' 
                          ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                          : d.priority === 'Medium' 
                          ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {d.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-blue-700 font-bold">{d.workOrder || 'Pending'}</td>
                    <td className="py-3.5 px-3 text-slate-700">{d.assignedTo}</td>
                    <td className="py-3.5 px-3 font-mono text-amber-700 font-bold">{d.dueDate}</td>
                    <td className="py-3.5 px-3 font-mono text-emerald-700 font-bold">{d.dateCorrected || '—'}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                        d.status === 'Resolved' || d.status === 'Closed' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(d)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg"
                          title="Edit Deficiency"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteDeficiency(d.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating / Editing Deficiency */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{form.id ? 'Edit Deficiency Record' : 'Log New Inspection Deficiency'}</span>
              </h3>
              <button onClick={() => setDropdownModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Inspection Source</label>
                <input
                  type="text"
                  required
                  value={form.inspectionTitle}
                  onChange={(e) => setForm({ ...form, inspectionTitle: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 font-medium px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Deficiency / Condition Found</label>
                  <button
                    type="button"
                    onClick={handleAiAnalyze}
                    disabled={aiLoading || !form.deficiency}
                    className="flex items-center gap-1 text-[11px] font-black text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>{aiLoading ? 'Analyzing...' : 'AI Recommend Work Order'}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={3}
                  value={form.deficiency}
                  onChange={(e) => setForm({ ...form, deficiency: e.target.value })}
                  placeholder="Describe exact discrepancy observed on vessel..."
                  className="w-full bg-slate-50 text-slate-900 font-medium px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-600"
                />
              </div>

              {aiSuggestion && (
                <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-900 space-y-1">
                  <div className="font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Safety Recommendation
                  </div>
                  <p className="font-medium">{aiSuggestion.recommendation}</p>
                  <div className="text-[10px] text-blue-700 font-bold mt-1">CFR/SMS Basis: {aiSuggestion.basisReference}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full bg-slate-50 text-slate-900 font-semibold px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Work Order #</label>
                  <input
                    type="text"
                    value={form.workOrder}
                    onChange={(e) => setForm({ ...form, workOrder: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Department/Crew</label>
                  <input
                    type="text"
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 font-medium px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 font-semibold px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full bg-slate-50 text-slate-900 font-semibold px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date Corrected</label>
                  <input
                    type="date"
                    value={form.dateCorrected || ''}
                    onChange={(e) => setForm({ ...form, dateCorrected: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 font-semibold px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes & Verification</label>
                <input
                  type="text"
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Closeout notes, verified by mate..."
                  className="w-full bg-slate-50 text-slate-900 font-medium px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDropdownModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-extrabold shadow-sm"
                >
                  Save Deficiency Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
