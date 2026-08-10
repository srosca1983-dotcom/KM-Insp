import React, { useState } from 'react';
import { Smartphone, Wifi, QrCode, Copy, Check, ShieldCheck, Monitor, Tablet, Radio } from 'lucide-react';

interface MobileConnectModalProps {
  onClose: () => void;
}

export const MobileConnectModal: React.FC<MobileConnectModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Generate a clean SVG QR code using Google Chart QR API or SVG fallback
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}&color=0284c7&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Mobile Phone & Tablet WiFi Connect</h3>
              <p className="text-xs text-slate-500">R/V Kilo Moana Shipboard Network Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-3">
          <div className="bg-white p-3 rounded-xl shadow-md border border-slate-200/80 inline-block">
            <img
              src={qrCodeUrl}
              alt="Scan QR Code to open on Mobile Phone"
              className="w-48 h-48 object-contain rounded-lg"
              onError={(e) => {
                // Fallback if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="text-xs text-slate-600 font-medium flex items-center justify-center gap-1.5">
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Scan with mobile phone camera on vessel WiFi</span>
          </div>
        </div>

        {/* Direct URL Copy */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Direct Network Address (URL):</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-slate-100 text-slate-800 text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 text-xs text-slate-700 space-y-2">
          <div className="font-bold text-blue-900 flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-blue-600" />
            <span>Shipboard Local WiFi Connection Guide</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed">
            <li>Ensure mobile phone or iPad is connected to vessel WiFi network.</li>
            <li>Scan QR code above or paste the URL in Safari / Chrome on mobile.</li>
            <li>All inspection check sheets, sign-offs, and deficiencies sync in real-time on Port 3000 across all deck tablets and phones!</li>
          </ol>
        </div>

        {/* Modal Action */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
