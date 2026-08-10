import React, { useState, useEffect, useCallback } from 'react';
import { AppDatabase, NavTab, InspectionId, InspectionItem, DeficiencyItem, CertificateItem, InspectionSignoff, NetworkUser } from './types';
import { initialDatabase } from './initialData';
import { api } from './services/api';
import { Header, PRESET_USERS } from './components/Header';
import { Navigation } from './components/Navigation';
import { ComplianceDashboard } from './components/ComplianceDashboard';
import { MasterCalendarView } from './components/MasterCalendarView';
import { InspectionSheetView } from './components/InspectionSheetView';
import { DeficiencyLogView } from './components/DeficiencyLogView';
import { CertificateRegisterView } from './components/CertificateRegisterView';
import { AuditLogView } from './components/AuditLogView';
import { MonthlyBinderView } from './components/MonthlyBinderView';
import { NetworkUsersModal } from './components/NetworkUsersModal';
import { MobileConnectModal } from './components/MobileConnectModal';
import { InstallAppModal } from './components/InstallAppModal';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [db, setDb] = useState<AppDatabase>(initialDatabase);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [activeUser, setActiveUser] = useState<NetworkUser>(PRESET_USERS[1]); // Default Chief Mate
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [usersModalOpen, setUsersModalOpen] = useState<boolean>(false);
  const [mobileModalOpen, setMobileModalOpen] = useState<boolean>(false);
  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load Initial DB from Express Server
  const fetchDb = useCallback(async () => {
    try {
      const data = await api.getDb();
      setDb(data);
    } catch (e) {
      console.warn("Could not fetch DB from server, using local fallback state", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDb();
  }, [fetchDb]);

  // Connect to Real-time Server-Sent Events (SSE) for Network Sync
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        setSseConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'SHEET_UPDATED' || parsed.type === 'INSPECTION_COMPLETED' || parsed.type === 'DEFICIENCY_UPDATED' || parsed.type === 'DEFICIENCY_DELETED' || parsed.type === 'CERTIFICATE_UPDATED' || parsed.type === 'DATABASE_RESET') {
            fetchDb();
          } else if (parsed.type === 'USER_PRESENCE') {
            if (parsed.payload?.users) {
              setDb(prev => ({ ...prev, connectedUsers: parsed.payload.users }));
            }
          }
        } catch (err) {
          console.error("Error parsing SSE event", err);
        }
      };

      eventSource.onerror = () => {
        setSseConnected(false);
      };
    } catch (e) {
      setSseConnected(false);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [fetchDb]);

  // Heartbeat Presence to Server
  useEffect(() => {
    const userPayload: NetworkUser = {
      ...activeUser,
      currentSheet: activeTab,
    };
    api.sendPresence(userPayload);

    const interval = setInterval(() => {
      api.sendPresence(userPayload);
    }, 12000);

    return () => clearInterval(interval);
  }, [activeUser, activeTab]);

  // Sheet Items Update
  const handleSaveSheetItems = async (sheetId: string, items: InspectionItem[]) => {
    // Local optimistic update
    setDb(prev => {
      const sheet = prev.sheets[sheetId as InspectionId];
      if (!sheet) return prev;
      return {
        ...prev,
        sheets: {
          ...prev.sheets,
          [sheetId]: { ...sheet, items }
        }
      };
    });

    try {
      await api.updateSheetItems(sheetId, items, activeUser.name);
    } catch (e) {
      console.error(e);
    }
  };

  // Sheet Signoff
  const handleSignoffSheet = async (sheetId: string, signoff: InspectionSignoff) => {
    try {
      const res = await api.signoffSheet(sheetId, signoff, activeUser.name);
      if (res.sheet) {
        fetchDb();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Deficiency Save
  const handleSaveDeficiency = async (deficiency: DeficiencyItem) => {
    try {
      await api.saveDeficiency(deficiency);
      fetchDb();
    } catch (e) {
      console.error(e);
    }
  };

  // Deficiency Delete
  const handleDeleteDeficiency = async (id: string) => {
    try {
      await api.deleteDeficiency(id);
      fetchDb();
    } catch (e) {
      console.error(e);
    }
  };

  // Certificate Save
  const handleSaveCertificate = async (cert: CertificateItem) => {
    try {
      await api.saveCertificate(cert);
      fetchDb();
    } catch (e) {
      console.error(e);
    }
  };

  // Reset Factory Data
  const handleResetData = async () => {
    if (window.confirm("Are you sure you want to reset all inspection data back to factory defaults?")) {
      try {
        await api.resetData();
        fetchDb();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Flag Deficiency Helper
  const handleFlagDeficiency = (partialDef: Partial<DeficiencyItem>) => {
    const newDef: DeficiencyItem = {
      id: `DEF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      dateFound: new Date().toISOString().substring(0, 10),
      inspectionId: partialDef.inspectionId || 'general',
      inspectionTitle: partialDef.inspectionTitle || 'Inspection',
      deficiency: partialDef.deficiency || 'Deficiency noted during visual inspection',
      priority: 'Medium',
      workOrder: `WO-${Math.floor(88000 + Math.random() * 1000)}`,
      assignedTo: `${activeUser.role}`,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      dateCorrected: '',
      verifiedBy: '',
      status: 'Open',
      notes: 'Auto-flagged from inspection sheet check',
      initials: activeUser.name.split(' ').map(n => n[0]).join(''),
    };

    handleSaveDeficiency(newDef);
    setActiveTab('deficiency-log');
  };

  const handlePrint = () => {
    window.print();
  };

  const openDeficienciesCount = db.deficiencyLog.filter(d => d.status === 'Open' || d.status === 'In Progress').length;
  const dueSoonCount = db.masterCalendar.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 4).length;
  const certWarningCount = db.certificateRegister.filter(c => c.daysRemaining <= 30).length;

  // Determine if active tab is one of the 16 sheets
  const activeSheet = db.sheets[activeTab as InspectionId];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Bar */}
      <Header
        activeUser={activeUser}
        onUserChange={setActiveUser}
        connectedUsers={db.connectedUsers || []}
        onOpenUsersModal={() => setUsersModalOpen(true)}
        onOpenMobileModal={() => setMobileModalOpen(true)}
        onOpenInstallModal={() => setInstallModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onResetData={handleResetData}
        sseConnected={sseConnected}
        onPrint={handlePrint}
      />

      {/* Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        openDeficienciesCount={openDeficienciesCount}
        dueSoonCount={dueSoonCount}
        certWarningCount={certWarningCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Connecting to R/V Kilo Moana Network Database...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <ComplianceDashboard db={db} onSelectSheet={setActiveTab} />
            )}

            {activeTab === 'master-calendar' && (
              <MasterCalendarView masterCalendar={db.masterCalendar} onSelectSheet={setActiveTab} />
            )}

            {activeTab === 'audit-log' && (
              <AuditLogView auditLog={db.auditLog} onSelectSheet={setActiveTab} />
            )}

            {activeTab === 'deficiency-log' && (
              <DeficiencyLogView
                deficiencies={db.deficiencyLog}
                onSaveDeficiency={handleSaveDeficiency}
                onDeleteDeficiency={handleDeleteDeficiency}
                onSelectSheet={setActiveTab}
              />
            )}

            {activeTab === 'certificates' && (
              <CertificateRegisterView
                certificates={db.certificateRegister}
                onSaveCertificate={handleSaveCertificate}
              />
            )}

            {activeTab === 'binder' && (
              <MonthlyBinderView db={db} onSelectSheet={setActiveTab} onPrint={handlePrint} />
            )}

            {/* Render Active Inspection Sheet */}
            {activeSheet && (
              <InspectionSheetView
                sheet={activeSheet}
                activeUser={activeUser}
                onSaveItems={(items) => handleSaveSheetItems(activeSheet.id, items)}
                onSignoff={(signoff) => handleSignoffSheet(activeSheet.id, signoff)}
                onFlagDeficiency={handleFlagDeficiency}
                onBackToCalendar={() => setActiveTab('master-calendar')}
                onPrint={handlePrint}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-xs py-4 px-6 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-300">R/V KILO MOANA (AGOR-26)</span> — University of Hawaii Marine Center / US Coast Guard Subchapter U Inspection Management
          </div>
          <div className="text-[11px] text-slate-400">
            Network Sync: <strong className="text-emerald-400">Port 3000 Active</strong> | Multi-Device Broadcast Ready
          </div>
        </div>
      </footer>

      {/* Network Users Modal */}
      {usersModalOpen && (
        <NetworkUsersModal
          users={db.connectedUsers || []}
          activeUser={activeUser}
          onClose={() => setUsersModalOpen(false)}
        />
      )}

      {/* Mobile Connect QR Modal */}
      {mobileModalOpen && (
        <MobileConnectModal
          onClose={() => setMobileModalOpen(false)}
        />
      )}

      {/* Install App Modal */}
      {installModalOpen && (
        <InstallAppModal
          isOpen={installModalOpen}
          onClose={() => setInstallModalOpen(false)}
        />
      )}
    </div>
  );
}
