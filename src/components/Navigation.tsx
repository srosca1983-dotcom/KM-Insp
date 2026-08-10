import React, { useState } from 'react';
import { 
  LayoutDashboard, Calendar, ClipboardCheck, AlertTriangle, FileBadge, 
  BookOpen, ChevronDown, Flame, LifeBuoy, Zap, Shield
} from 'lucide-react';
import { InspectionId } from '../types';

export type NavTab = 
  | 'dashboard'
  | 'master-calendar'
  | 'audit-log'
  | 'deficiency-log'
  | 'certificates'
  | 'binder'
  | InspectionId;

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  openDeficienciesCount: number;
  dueSoonCount: number;
  certWarningCount: number;
}

const INSPECTION_CATEGORIES = [
  {
    category: 'Fire & Suppression',
    icon: Flame,
    sheets: [
      { id: 'fixed-fire', title: 'Fixed Fire Systems' },
      { id: 'fire-stations', title: 'Fire Stations' },
      { id: 'fire-extinguishers', title: 'Fire Extinguishers' },
      { id: 'turnout-gear', title: 'Turnout Gear SCBA' },
    ]
  },
  {
    category: 'Lifesaving & Rescue',
    icon: LifeBuoy,
    sheets: [
      { id: 'weekly-lifesaving', title: 'Weekly Lifesaving' },
      { id: 'lifesaving-monthly', title: 'Lifesaving Monthly' },
      { id: 'rescue-boat', title: 'Rescue Boat Monthly' },
      { id: 'lifejackets-immersion', title: 'Lifejackets Immersion' },
      { id: 'pyrotechnics-locker', title: 'Pyrotechnics Locker' },
    ]
  },
  {
    category: 'Engineering & Damage Control',
    icon: Zap,
    sheets: [
      { id: 'dewatering-pumps', title: 'De-Watering Pumps' },
      { id: 'damage-control', title: 'Damage Control Gear' },
      { id: 'watertight-doors', title: 'Watertight Doors' },
    ]
  },
  {
    category: 'Hazmat, Safety & Bridge',
    icon: Shield,
    sheets: [
      { id: 'dg-locker', title: 'DG Locker Monthly' },
      { id: 'eebd', title: 'EEBD' },
      { id: 'eyewash-firstaid', title: 'Eye Wash Decon First Aid' },
      { id: 'gmdss-bridge', title: 'GMDSS Bridge Safety' },
    ]
  }
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  openDeficienciesCount,
  dueSoonCount,
  certWarningCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isSheetActive = INSPECTION_CATEGORIES.some(cat => 
    cat.sheets.some(s => s.id === activeTab)
  );

  return (
    <nav className="bg-white border-b border-slate-200 text-slate-800 px-4 sm:px-6 lg:px-8 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar scrollbar-none py-1.5">
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs font-semibold">
          {/* Dashboard */}
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* Master Calendar */}
          <button
            onClick={() => onTabChange('master-calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'master-calendar'
                ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Master Calendar</span>
            {dueSoonCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px]">
                {dueSoonCount}
              </span>
            )}
          </button>

          {/* 16 Inspection Sheets Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
                isSheetActive
                  ? 'bg-blue-50 text-blue-700 font-extrabold border border-blue-200 shadow-sm'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              <span>Inspection Sheets (16)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-2.5 z-50 max-h-[75vh] overflow-y-auto">
                <div className="px-2 py-1.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Inspection Sheet
                </div>
                {INSPECTION_CATEGORIES.map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <div key={idx} className="mt-2.5">
                      <div className="px-2 py-1 text-[11px] font-extrabold text-blue-700 flex items-center gap-1">
                        <Icon className="w-3.5 h-3.5 text-blue-600" />
                        <span>{cat.category}</span>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {cat.sheets.map((sheet) => (
                          <button
                            key={sheet.id}
                            onClick={() => {
                              onTabChange(sheet.id as NavTab);
                              setDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                              activeTab === sheet.id
                                ? 'bg-blue-600 text-white font-bold'
                                : 'hover:bg-slate-100 text-slate-800 font-medium'
                            }`}
                          >
                            <span>{sheet.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Audit Log */}
          <button
            onClick={() => onTabChange('audit-log')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'audit-log'
                ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Audit Log</span>
          </button>

          {/* Deficiency Log */}
          <button
            onClick={() => onTabChange('deficiency-log')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'deficiency-log'
                ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Deficiency Log</span>
            {openDeficienciesCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-rose-600 text-white font-black rounded-full text-[10px]">
                {openDeficienciesCount}
              </span>
            )}
          </button>

          {/* Certificate Register */}
          <button
            onClick={() => onTabChange('certificates')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'certificates'
                ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <FileBadge className="w-4 h-4 text-blue-600" />
            <span>Certificate Register</span>
            {certWarningCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px]">
                {certWarningCount}
              </span>
            )}
          </button>

          {/* Monthly Safety Binder */}
          <button
            onClick={() => onTabChange('binder')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'binder'
                ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Monthly Safety Binder</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
