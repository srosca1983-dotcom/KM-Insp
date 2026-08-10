import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Laptop, CheckCircle2, Share, PlusSquare, ShieldCheck, X } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'ios' | 'android' | 'desktop'>('prompt');

  useEffect(() => {
    // Listen for native PWA installation prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-900 text-xs">
        {/* Modal Header */}
        <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black">Install R/V Kilo Moana App</h3>
              <p className="text-[11px] text-blue-100 font-medium">Add to Home Screen / Desktop for Offline & Fast Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-blue-100 hover:text-white rounded-lg hover:bg-white/10 text-lg font-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Installed Success Banner */}
          {isInstalled ? (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-black text-sm text-emerald-950">App Is Installed & Ready!</h4>
              <p className="text-xs text-emerald-800 font-medium">
                R/V Kilo Moana Safety App is running as a native standalone application.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Native Prompt Banner if supported */}
              {deferredPrompt && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center space-y-3">
                  <h4 className="font-extrabold text-xs text-blue-950 uppercase tracking-wider">One-Click Direct Installation Available</h4>
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install R/V Kilo Moana App Now</span>
                  </button>
                </div>
              )}

              {/* Operating System Specific Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-extrabold text-slate-700">Platform Installation Guide:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('ios')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${activeTab === 'ios' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      iPhone / iPad
                    </button>
                    <button
                      onClick={() => setActiveTab('android')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${activeTab === 'android' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      Android
                    </button>
                    <button
                      onClick={() => setActiveTab('desktop')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${activeTab === 'desktop' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      PC / Mac
                    </button>
                  </div>
                </div>

                {/* Instructions per platform */}
                {activeTab === 'ios' || activeTab === 'prompt' ? (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-slate-800 font-medium">
                    <div className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span>iOS (Safari) Installation Steps:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] text-slate-700">
                      <li>Open this page in <strong>Safari</strong> on your iPhone or iPad.</li>
                      <li>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-blue-600" /> at the bottom or top bar.</li>
                      <li>Scroll down and select <strong>"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-blue-600" />.</li>
                      <li>Tap <strong>"Add"</strong> in the top right. Launch directly from your home screen!</li>
                    </ol>
                  </div>
                ) : activeTab === 'android' ? (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-slate-800 font-medium">
                    <div className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Android (Chrome) Installation Steps:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] text-slate-700">
                      <li>Open this page in <strong>Google Chrome</strong> on your tablet or phone.</li>
                      <li>Tap the menu icon (<strong>⋮</strong>) in the top right corner.</li>
                      <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>Confirm installation when prompted.</li>
                    </ol>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-slate-800 font-medium">
                    <div className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                      <Laptop className="w-4 h-4 text-blue-600" />
                      <span>Windows / Mac (Chrome, Edge, Safari) Steps:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] text-slate-700">
                      <li>Look for the <strong>Install Icon</strong> <Download className="w-3.5 h-3.5 inline text-blue-600" /> in the browser address bar.</li>
                      <li>Click <strong>Install</strong> to add to your desktop or Start Menu.</li>
                      <li>Enjoy full windowed, offline-capable app execution without browser headers!</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Benefits List */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-bold bg-slate-100 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Offline Support</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Shipboard WiFi Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>No App Store Needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Launching</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl transition text-xs"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
