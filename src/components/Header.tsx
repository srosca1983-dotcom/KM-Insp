import React, { useState } from 'react';
import { Anchor, Smartphone, Users, Search, RefreshCw, Printer, CheckCircle2, ChevronDown, Edit, Download } from 'lucide-react';
import { NetworkUser } from '../types';

export const PRESET_USERS: NetworkUser[] = [
  { id: 'usr-1', name: 'Capt. Taylor', role: 'Vessel Master', device: 'Bridge Workstation', currentSheet: 'Dashboard', lastActive: 'Just now' },
  { id: 'usr-2', name: 'Chief Mate Alex', role: 'Chief Mate / Safety OIC', device: 'Bridge iPad', currentSheet: 'Fixed Fire Systems', lastActive: 'Active now' },
  { id: 'usr-3', name: '2nd Mate Jordan', role: '2nd Mate / Navigation', device: 'Nav Phone', currentSheet: 'Master Calendar', lastActive: '2m ago' },
  { id: 'usr-4', name: '3rd Mate Morgan', role: '3rd Mate / Safety Tech', device: 'Deck Tablet', currentSheet: 'Weekly Lifesaving', lastActive: 'Active now' },
];

interface HeaderProps {
  activeUser: NetworkUser;
  onUserChange: (user: NetworkUser) => void;
  connectedUsers: NetworkUser[];
  onOpenUsersModal: () => void;
  onOpenMobileModal: () => void;
  onOpenInstallModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onResetData: () => void;
  sseConnected: boolean;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeUser,
  onUserChange,
  connectedUsers,
  onOpenUsersModal,
  onOpenMobileModal,
  onOpenInstallModal,
  searchQuery,
  onSearchChange,
  onResetData,
  sseConnected,
  onPrint,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-sm print:hidden">
      {/* Top Vessel Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Vessel Branding */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-md shadow-blue-500/20">
            <Anchor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg tracking-tight text-slate-900 leading-tight">
                R/V KILO MOANA <span className="text-[11px] text-blue-800 font-black px-2 py-0.5 bg-blue-100 rounded-md border border-blue-200">AGOR-26</span>
              </h1>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">Safety Compliance & Master Inspection System</p>
          </div>
        </div>

        {/* Sync Status, Install App, Mobile WiFi & Active Officer Controls */}
        <div className="flex items-center gap-2.5 text-xs flex-wrap">
          {/* Live Sync Status */}
          <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-black ${
            sseConnected 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${sseConnected ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
            </span>
            <span>{sseConnected ? 'WiFi Live Sync' : 'Polling Sync'}</span>
          </div>

          {/* Install App Button */}
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition shadow-sm border border-emerald-500/30"
            title="Install application to home screen or desktop for offline access"
          >
            <Download className="w-4 h-4" />
            <span>Install App</span>
          </button>

          {/* Mobile Phone / WiFi Connect QR Modal Launcher */}
          <button
            onClick={onOpenMobileModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition shadow-sm border border-blue-500/30"
            title="Connect phone/tablet over shipboard WiFi"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Phone / WiFi Connect</span>
            <span className="sm:hidden">WiFi</span>
          </button>

          {/* Connected Crew Button */}
          <button
            onClick={onOpenUsersModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold transition"
            title="View or edit active officer roster"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>{connectedUsers.length} Online</span>
          </button>

          {/* Active Officer Persona Switcher & Editor */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 transition"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <div className="text-left">
                <div className="font-black text-xs leading-none text-slate-900">{activeUser.name}</div>
                <div className="text-[10px] font-bold text-blue-700 leading-none mt-1">{activeUser.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <span>Switch Active Officer</span>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenUsersModal();
                    }}
                    className="text-blue-600 hover:underline flex items-center gap-1 normal-case font-bold"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Manage / Edit</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto py-1">
                  {connectedUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onUserChange(u);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                        activeUser.id === u.id ? 'bg-blue-50/80 text-blue-950 font-black' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold">{u.name}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{u.role} • {u.device}</div>
                      </div>
                      {activeUser.id === u.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>

                <div className="px-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenUsersModal();
                    }}
                    className="w-full text-center py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-extrabold transition"
                  >
                    + Edit or Add New Officer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub Bar: Search & Utility Controls */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Global Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search across all 16 inspection sheets, AMOS #s, or deficiencies..."
              className="w-full bg-white text-xs text-slate-900 font-medium pl-9 pr-8 py-2 rounded-xl border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold transition shadow-sm"
              title="Print active sheet or generate PDF binder"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onResetData}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-300 hover:border-rose-300 transition font-bold shadow-sm"
              title="Reset data back to default initial state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
