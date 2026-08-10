import React, { useState } from 'react';
import { FileBadge, Plus, Search, Filter, AlertTriangle, CheckCircle2, Clock, Edit } from 'lucide-react';
import { CertificateItem } from '../types';

interface CertificateRegisterViewProps {
  certificates: CertificateItem[];
  onSaveCertificate: (cert: CertificateItem) => void;
}

export const CertificateRegisterView: React.FC<CertificateRegisterViewProps> = ({
  certificates,
  onSaveCertificate,
}) => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<CertificateItem>>({
    id: '',
    certificateSystem: '',
    vendor: 'Pacific Marine Vendor',
    inspector: 'Marine Inspector',
    issueDate: new Date().toISOString().substring(0, 10),
    serviceTestDate: new Date().toISOString().substring(0, 10),
    expirationNextDue: new Date(Date.now() + 365 * 86400000).toISOString().substring(0, 10),
    daysRemaining: 365,
    status: 'Current',
    equipmentNotes: '',
  });

  const filtered = certificates.filter(c => {
    if (search) {
      const q = search.toLowerCase();
      return (
        c.certificateSystem.toLowerCase().includes(q) ||
        c.vendor.toLowerCase().includes(q) ||
        c.inspector.toLowerCase().includes(q) ||
        c.equipmentNotes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleEdit = (c: CertificateItem) => {
    setForm(c);
    setModalOpen(true);
  };

  const handleCreateNew = () => {
    setForm({
      id: '',
      certificateSystem: '',
      vendor: 'Honolulu Safety Services Inc.',
      inspector: 'Marine Surveyor',
      issueDate: new Date().toISOString().substring(0, 10),
      serviceTestDate: new Date().toISOString().substring(0, 10),
      expirationNextDue: new Date(Date.now() + 365 * 86400000).toISOString().substring(0, 10),
      daysRemaining: 365,
      status: 'Current',
      equipmentNotes: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.certificateSystem) return;

    // Calculate days remaining
    const expDate = new Date(form.expirationNextDue || '');
    const diffDays = Math.ceil((expDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    
    let status: any = 'Current';
    if (diffDays <= 0) status = 'Expired';
    else if (diffDays <= 15) status = 'Critical';
    else if (diffDays <= 30) status = 'Due Soon';

    onSaveCertificate({
      ...form,
      daysRemaining: diffDays,
      status,
    } as CertificateItem);

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider">
              <FileBadge className="w-4 h-4 text-blue-600" />
              <span>R/V KILO MOANA CERTIFICATE REGISTER</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Vendor Certificate & Regulatory Service Register
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Track vendor certificates, annual service dates, USCG / ABS survey expiration dates, and remaining grace periods.
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-sm transition text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Register Vendor Certificate</span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search certificates, vendors, inspectors..."
              className="w-full bg-slate-50 text-xs text-slate-900 font-medium pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="text-slate-600 font-semibold">
            Total Active Certificates: <strong className="text-slate-900 font-black">{certificates.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Certificates Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Certificate / System</th>
                <th className="py-3.5 px-3">Vendor Name</th>
                <th className="py-3.5 px-3">Inspector</th>
                <th className="py-3.5 px-3">Issue Date</th>
                <th className="py-3.5 px-3">Service / Test Date</th>
                <th className="py-3.5 px-3">Expiration / Next Due</th>
                <th className="py-3.5 px-3">Days Left</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4">Equipment / Notes</th>
                <th className="py-3.5 px-2 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-500 font-medium">
                    No certificate records match search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  let badge = (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Current
                    </span>
                  );

                  if (c.daysRemaining <= 0 || c.status === 'Expired') {
                    badge = (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                        Expired
                      </span>
                    );
                  } else if (c.daysRemaining <= 15 || c.status === 'Critical') {
                    badge = (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                        Critical ({c.daysRemaining}d)
                      </span>
                    );
                  } else if (c.daysRemaining <= 30 || c.status === 'Due Soon') {
                    badge = (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                        Due Soon ({c.daysRemaining}d)
                      </span>
                    );
                  }

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-black text-slate-900">{c.certificateSystem}</td>
                      <td className="py-3.5 px-3 text-slate-700">{c.vendor || '—'}</td>
                      <td className="py-3.5 px-3 text-slate-600">{c.inspector || '—'}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">{c.issueDate || '—'}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-700">{c.serviceTestDate || '—'}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{c.expirationNextDue || '—'}</td>
                      <td className="py-3.5 px-3 font-mono font-extrabold">
                        <span className={c.daysRemaining <= 30 ? 'text-amber-700' : 'text-slate-700'}>
                          {c.daysRemaining} days
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">{badge}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate font-normal" title={c.equipmentNotes}>
                        {c.equipmentNotes || '—'}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg"
                          title="Edit Certificate"
                        >
                          <Edit className="w-3.5 h-3.5" />
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <FileBadge className="w-4 h-4 text-blue-600" />
                <span>{form.id ? 'Edit Certificate Record' : 'Register Vendor Certificate'}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Certificate / System Name</label>
                <input
                  type="text"
                  required
                  value={form.certificateSystem}
                  onChange={(e) => setForm({ ...form, certificateSystem: e.target.value })}
                  placeholder="e.g. Fixed Fire Suppression Certificate"
                  className="w-full bg-slate-50 text-slate-900 font-medium px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 font-medium px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inspector / Surveyor</label>
                  <input
                    type="text"
                    value={form.inspector}
                    onChange={(e) => setForm({ ...form, inspector: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 font-medium px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 font-medium px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service / Test Date</label>
                  <input
                    type="date"
                    value={form.serviceTestDate}
                    onChange={(e) => setForm({ ...form, serviceTestDate: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 font-medium px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={form.expirationNextDue}
                    onChange={(e) => setForm({ ...form, expirationNextDue: e.target.value })}
                    className="w-full bg-slate-50 text-blue-700 px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Equipment / Inspection Notes</label>
                <textarea
                  rows={2}
                  value={form.equipmentNotes}
                  onChange={(e) => setForm({ ...form, equipmentNotes: e.target.value })}
                  placeholder="Details regarding serials, pressure readings, certificate tags..."
                  className="w-full bg-slate-50 text-slate-900 font-medium px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold shadow-sm"
                >
                  Save Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
