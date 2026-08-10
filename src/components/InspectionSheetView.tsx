import React, { useState } from 'react';
import { 
  Check, X, AlertTriangle, CheckCircle2, ShieldCheck, Printer, Save, 
  FileText, UserCheck, Calendar, Clock, ArrowLeft, RefreshCw, Anchor
} from 'lucide-react';
import { InspectionSheetData, InspectionItem, DeficiencyItem, InspectionSignoff, SatUnsat, NetworkUser } from '../types';

interface InspectionSheetViewProps {
  sheet: InspectionSheetData;
  activeUser: NetworkUser;
  onSaveItems: (items: InspectionItem[]) => void;
  onSignoff: (signoff: InspectionSignoff) => void;
  onFlagDeficiency: (deficiency: Partial<DeficiencyItem>) => void;
  onBackToCalendar: () => void;
  onPrint: () => void;
}

export const InspectionSheetView: React.FC<InspectionSheetViewProps> = ({
  sheet,
  activeUser,
  onSaveItems,
  onSignoff,
  onFlagDeficiency,
  onBackToCalendar,
  onPrint,
}) => {
  const [items, setItems] = useState<InspectionItem[]>(sheet.items || []);
  const [signoffForm, setSignoffForm] = useState<InspectionSignoff>({
    mateName: sheet.signoff?.mateName || activeUser.name,
    position: sheet.signoff?.position || activeUser.role,
    signatureInitials: sheet.signoff?.signatureInitials || activeUser.name.split(' ').map(n => n[0]).join(''),
    dateCompleted: sheet.signoff?.dateCompleted || new Date().toISOString().substring(0, 10),
    timeCompleted: sheet.signoff?.timeCompleted || new Date().toTimeString().substring(0, 5),
  });

  const [saving, setSaving] = useState(false);
  const [signoffSuccess, setSignoffSuccess] = useState(false);

  // Update item field helper
  const handleItemChange = (id: string, field: keyof InspectionItem, value: any) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(updated);
    onSaveItems(updated);
  };

  // Quick "Mark All SAT"
  const handleMarkAllSat = () => {
    const updated = items.map(item => ({
      ...item,
      satStatus: 'SAT' as SatUnsat,
      w1: item.w1 !== undefined ? ('SAT' as SatUnsat) : item.w1,
      w2: item.w2 !== undefined ? ('SAT' as SatUnsat) : item.w2,
      w3: item.w3 !== undefined ? ('SAT' as SatUnsat) : item.w3,
      w4: item.w4 !== undefined ? ('SAT' as SatUnsat) : item.w4,
      w5: item.w5 !== undefined ? ('SAT' as SatUnsat) : item.w5,
      fuelOilCheck: item.fuelOilCheck !== undefined ? ('SAT' as SatUnsat) : item.fuelOilCheck,
      hosesStrainersCheck: item.hosesStrainersCheck !== undefined ? ('SAT' as SatUnsat) : item.hosesStrainersCheck,
      operationalTestCheck: item.operationalTestCheck !== undefined ? ('SAT' as SatUnsat) : item.operationalTestCheck,
    }));
    setItems(updated);
    onSaveItems(updated);
  };

  // Submit signoff
  const handleSignoffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onSignoff(signoffForm);
    setTimeout(() => {
      setSaving(false);
      setSignoffSuccess(true);
      setTimeout(() => setSignoffSuccess(false), 4000);
    }, 400);
  };

  const isWeekly = sheet.id === 'weekly-lifesaving';
  const isExtinguishers = sheet.id === 'fire-extinguishers';
  const isPumps = sheet.id === 'dewatering-pumps';
  const isLifejackets = sheet.id === 'lifejackets-immersion';

  return (
    <div className="space-y-6">
      {/* Official Printable Header (Visible only when printed) */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-4 text-black">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">R/V KILO MOANA (AGOR-26)</h1>
            <p className="text-xs font-bold">University of Hawaii Marine Center — Vessel Safety Management System (SMS)</p>
            <p className="text-[10px] italic">US Coast Guard Subchapter U Inspection Record</p>
          </div>
          <div className="text-right text-xs font-mono font-bold">
            <div>Form Ref: {sheet.id.toUpperCase()}</div>
            <div>Date Printed: {new Date().toISOString().substring(0, 10)}</div>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-black flex justify-between items-center text-xs font-bold">
          <div>Inspection: {sheet.title}</div>
          <div>Signing Officer: {signoffForm.mateName} ({signoffForm.position})</div>
        </div>
      </div>

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-200/50 print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={onBackToCalendar}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-extrabold mb-2.5 print:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Master Calendar</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider print:border-black print:bg-white print:text-black">
                FORM: {sheet.id.toUpperCase()}
              </span>
              <h1 className="text-2xl font-black text-slate-900 print:text-xl print:text-black">
                {sheet.title}
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 italic font-medium print:text-black">
              {sheet.subtitle}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 text-xs print:hidden">
            <button
              onClick={handleMarkAllSat}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-sm transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark All SAT</span>
            </button>

            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200 transition"
              title="Print form for physical filing in vessel safety binder"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print:border-black print:rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 print:bg-white print:text-black">
              <tr>
                <th className="py-3.5 px-4 border-r border-slate-200 print:border-black">
                  {isWeekly ? 'Category' : isPumps ? 'Pump' : isExtinguishers ? 'ID' : 'Equipment / Location'}
                </th>

                {isWeekly && <th className="py-3.5 px-3 border-r border-slate-200 print:border-black">AMOS #</th>}
                {isPumps && (
                  <>
                    <th className="py-3.5 px-3 border-r border-slate-200 print:border-black">Location</th>
                    <th className="py-3.5 px-3 border-r border-slate-200 print:border-black">AMOS # / Serial</th>
                    <th className="py-3.5 px-3 border-r border-slate-200 print:border-black">Capacity</th>
                  </>
                )}

                {isExtinguishers && (
                  <>
                    <th className="py-3.5 px-3 border-r border-slate-200 print:border-black">Type</th>
                    <th className="py-3.5 px-4 border-r border-slate-200 print:border-black">Location</th>
                  </>
                )}

                {isLifejackets && (
                  <>
                    <th className="py-3.5 px-2 border-r border-slate-200 text-center print:border-black">PFD #</th>
                    <th className="py-3.5 px-2 border-r border-slate-200 text-center print:border-black">Suit #</th>
                  </>
                )}

                <th className="py-3.5 px-4 border-r border-slate-200 print:border-black">Inspection Criteria</th>

                {/* Specific Columns */}
                {isWeekly ? (
                  <>
                    <th className="py-3.5 px-2 text-center border-r border-slate-200 print:border-black">W1</th>
                    <th className="py-3.5 px-2 text-center border-r border-slate-200 print:border-black">W2</th>
                    <th className="py-3.5 px-2 text-center border-r border-slate-200 print:border-black">W3</th>
                    <th className="py-3.5 px-2 text-center border-r border-slate-200 print:border-black">W4</th>
                    <th className="py-3.5 px-2 text-center border-r border-slate-200 print:border-black">W5</th>
                  </>
                ) : isPumps ? (
                  <>
                    <th className="py-3.5 px-2 text-center border-r border-slate-200 print:border-black">Fuel/Oil</th>
                    <th className="py-3.5 px-2 text-center border-r border-slate-200 print:border-black">Hoses</th>
                    <th className="py-3.5 px-2 text-center border-r border-slate-200 print:border-black">Op Test</th>
                    <th className="py-3.5 px-3 text-center border-r border-slate-200 print:border-black">SAT / UNSAT</th>
                  </>
                ) : isExtinguishers ? (
                  <>
                    <th className="py-3.5 px-3 text-center border-r border-slate-200 print:border-black">Dry Chem Rotated</th>
                    <th className="py-3.5 px-3 text-center border-r border-slate-200 print:border-black">SAT / UNSAT</th>
                  </>
                ) : (
                  <th className="py-3.5 px-3 text-center border-r border-slate-200 print:border-black">SAT / UNSAT</th>
                )}

                <th className="py-3.5 px-4 print:border-black">Comments & Notes</th>
                <th className="py-3.5 px-2 text-center print:hidden">Flag</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium print:divide-black">
              {items.map((item, idx) => {
                const isUnsat = item.satStatus === 'UNSAT';

                return (
                  <tr
                    key={item.id || idx}
                    className={`hover:bg-slate-50 transition ${
                      isUnsat ? 'bg-rose-50/70 print:bg-white' : ''
                    }`}
                  >
                    {/* Item / Location Column */}
                    <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-100 print:border-black print:text-black">
                      <div>{item.name}</div>
                      {item.section && <div className="text-[10px] text-blue-600 font-bold print:text-black">{item.section}</div>}
                    </td>

                    {isWeekly && (
                      <td className="py-3 px-3 font-mono text-slate-600 border-r border-slate-100 font-semibold print:border-black print:text-black">
                        {item.amosNo || '—'}
                      </td>
                    )}

                    {isPumps && (
                      <>
                        <td className="py-3 px-3 text-slate-700 border-r border-slate-100 print:border-black print:text-black">{item.where}</td>
                        <td className="py-3 px-3 font-mono text-slate-600 border-r border-slate-100 print:border-black print:text-black">{item.amosNo} / {item.serialNo || 'N/A'}</td>
                        <td className="py-3 px-3 text-slate-700 border-r border-slate-100 font-semibold print:border-black print:text-black">{item.capacity}</td>
                      </>
                    )}

                    {isExtinguishers && (
                      <>
                        <td className="py-3 px-3 font-extrabold text-blue-700 border-r border-slate-100 print:border-black print:text-black">{item.amosNo}</td>
                        <td className="py-3 px-4 text-slate-700 border-r border-slate-100 print:border-black print:text-black">{item.where}</td>
                      </>
                    )}

                    {isLifejackets && (
                      <>
                        <td className="py-3 px-2 text-center font-bold text-blue-700 border-r border-slate-100 print:border-black print:text-black">{item.pfdCount ?? '—'}</td>
                        <td className="py-3 px-2 text-center font-bold text-emerald-700 border-r border-slate-100 print:border-black print:text-black">{item.suitCount ?? '—'}</td>
                      </>
                    )}

                    {/* Criteria Column */}
                    <td className="py-3 px-4 text-slate-700 border-r border-slate-100 max-w-sm print:border-black print:text-black">
                      {item.criteria}
                    </td>

                    {/* SAT/UNSAT Toggles */}
                    {isWeekly ? (
                      <>
                        {(['w1', 'w2', 'w3', 'w4', 'w5'] as const).map((wkKey) => (
                          <td key={wkKey} className="py-3 px-1 text-center border-r border-slate-100 print:border-black">
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = item[wkKey] === 'SAT' ? 'UNSAT' : item[wkKey] === 'UNSAT' ? '' : 'SAT';
                                handleItemChange(item.id, wkKey, nextVal);
                              }}
                              className={`w-8 h-8 rounded-lg text-xs font-black transition print:border print:border-black print:bg-white print:text-black ${
                                item[wkKey] === 'SAT' 
                                  ? 'bg-emerald-600 text-white shadow-sm' 
                                  : item[wkKey] === 'UNSAT' 
                                  ? 'bg-rose-600 text-white shadow-sm' 
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              }`}
                            >
                              {item[wkKey] || '—'}
                            </button>
                          </td>
                        ))}
                      </>
                    ) : isPumps ? (
                      <>
                        {(['fuelOilCheck', 'hosesStrainersCheck', 'operationalTestCheck'] as const).map((chkKey) => (
                          <td key={chkKey} className="py-3 px-1 text-center border-r border-slate-100 print:border-black">
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = item[chkKey] === 'SAT' ? 'UNSAT' : item[chkKey] === 'UNSAT' ? '' : 'SAT';
                                handleItemChange(item.id, chkKey, nextVal);
                              }}
                              className={`w-7 h-7 rounded-lg text-[10px] font-black print:border print:border-black print:bg-white print:text-black ${
                                item[chkKey] === 'SAT' ? 'bg-emerald-600 text-white' : item[chkKey] === 'UNSAT' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {item[chkKey] || '—'}
                            </button>
                          </td>
                        ))}
                        <td className="py-3 px-2 text-center border-r border-slate-100 print:border-black">
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = item.satStatus === 'SAT' ? 'UNSAT' : item.satStatus === 'UNSAT' ? '' : 'SAT';
                              handleItemChange(item.id, 'satStatus', nextVal);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition print:border print:border-black print:bg-white print:text-black ${
                              item.satStatus === 'SAT' ? 'bg-emerald-600 text-white' : item.satStatus === 'UNSAT' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {item.satStatus || 'Select'}
                          </button>
                        </td>
                      </>
                    ) : isExtinguishers ? (
                      <>
                        <td className="py-3 px-3 text-center border-r border-slate-100 print:border-black">
                          {item.dryChemRotated === 'Yes' ? (
                            <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200 text-[10px] print:border-black print:bg-white print:text-black">
                              Yes Rotated
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] font-medium print:text-black">N/A (CO2/Foam)</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-100 print:border-black">
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = item.satStatus === 'SAT' ? 'UNSAT' : item.satStatus === 'UNSAT' ? '' : 'SAT';
                              handleItemChange(item.id, 'satStatus', nextVal);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition print:border print:border-black print:bg-white print:text-black ${
                              item.satStatus === 'SAT' ? 'bg-emerald-600 text-white' : item.satStatus === 'UNSAT' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {item.satStatus || 'Select'}
                          </button>
                        </td>
                      </>
                    ) : (
                      <td className="py-3 px-3 text-center border-r border-slate-100 print:border-black">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleItemChange(item.id, 'satStatus', 'SAT')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition print:border print:border-black print:bg-white print:text-black ${
                              item.satStatus === 'SAT'
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/30'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            SAT
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemChange(item.id, 'satStatus', 'UNSAT')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition print:border print:border-black print:bg-white print:text-black ${
                              item.satStatus === 'UNSAT'
                                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400/30'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            UNSAT
                          </button>
                        </div>
                      </td>
                    )}

                    {/* Comments Input */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.comments || ''}
                        onChange={(e) => handleItemChange(item.id, 'comments', e.target.value)}
                        placeholder="Add comments or condition note..."
                        className="w-full bg-slate-50 text-xs text-slate-900 font-medium px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 focus:bg-white print:border-none print:bg-transparent"
                      />
                    </td>

                    {/* Flag Deficiency Button */}
                    <td className="py-2.5 px-2 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => onFlagDeficiency({
                          inspectionId: sheet.id,
                          inspectionTitle: sheet.title,
                          deficiency: `Deficiency noted on ${item.name}: ${item.comments || item.criteria}`,
                        })}
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                        title="Flag discrepancy to Deficiency Log"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completion & Signoff Review Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-200/50 print:border-black print:p-4 print:shadow-none">
        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between print:border-black">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2 print:text-black">
            <UserCheck className="w-5 h-5 text-blue-600 print:hidden" />
            <span>Completion / Official Sign-Off Review</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium print:hidden">
            Audit Log pulls directly from this sign-off block
          </span>
        </div>

        <form onSubmit={handleSignoffSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            {/* Mate Name / OIC */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 print:text-black">Mate Name / OIC</label>
              <input
                type="text"
                required
                value={signoffForm.mateName}
                onChange={(e) => setSignoffForm({ ...signoffForm, mateName: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 font-bold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 print:border-none print:bg-transparent"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 print:text-black">Position / Duty</label>
              <input
                type="text"
                required
                value={signoffForm.position}
                onChange={(e) => setSignoffForm({ ...signoffForm, position: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 font-bold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 print:border-none print:bg-transparent"
              />
            </div>

            {/* Signature Initials */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 print:text-black">Signature / Initials</label>
              <input
                type="text"
                required
                value={signoffForm.signatureInitials}
                onChange={(e) => setSignoffForm({ ...signoffForm, signatureInitials: e.target.value })}
                className="w-full bg-slate-50 text-blue-700 font-black px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 uppercase tracking-wider text-sm print:border-none print:bg-transparent print:text-black"
              />
            </div>

            {/* Date Completed */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 print:text-black">Date Completed</label>
              <input
                type="date"
                required
                value={signoffForm.dateCompleted}
                onChange={(e) => setSignoffForm({ ...signoffForm, dateCompleted: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 font-bold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 print:border-none print:bg-transparent"
              />
            </div>

            {/* Time Completed */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 print:text-black">Time Completed</label>
              <input
                type="time"
                required
                value={signoffForm.timeCompleted}
                onChange={(e) => setSignoffForm({ ...signoffForm, timeCompleted: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 font-bold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 print:border-none print:bg-transparent"
              />
            </div>
          </div>

          {/* Submit Signoff Button */}
          <div className="pt-2 flex items-center justify-between print:hidden">
            <div className="text-xs text-slate-500 font-medium">
              Signing off updates Master Calendar due dates & syncs across vessel network.
            </div>

            <div className="flex items-center gap-3">
              {signoffSuccess && (
                <span className="text-xs font-black text-emerald-700 flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Signed off & Synced to Network!
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Official Sign Off & Sync Inspection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
