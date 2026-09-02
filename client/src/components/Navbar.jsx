import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Settings,
  Smartphone,
  CheckCircle2,
  X,
  Share,
  LogOut,
  User,
} from 'lucide-react';

export const Navbar = ({
  onNewStudent,
  onImportExcel,
  onExportExcel,
  onOpenSettings,
  settings,
  currentUser,
  onLogout,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // If browser doesn't expose prompt (e.g. iOS Safari, Firefox, or already installed)
      setShowInstallGuide(true);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand & Crest Monogram */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="h-9 w-9 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-white p-0.5 shadow-md flex items-center justify-center border-2 border-red-600 overflow-hidden">
                <img src="/logo.png" alt="Shree Sai Classes" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-xl font-black tracking-tight text-blue-950 font-heading truncate">
                    {settings?.instituteName || 'SHREE SAI CLASSES'}
                  </span>
                  <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-700 bg-red-50 border border-red-200 rounded-full shrink-0">
                    FEE & BILLING
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                  {currentUser?.section === 'school'
                    ? '🏫 School Section (Classes 6th - 10th)'
                    : currentUser?.section === 'college'
                    ? '🎓 Commerce Section (11th & 12th FYJC/SYJC)'
                    : settings?.tagline || 'Automated Billing & Fee Receipt Console'}
                </p>
              </div>
            </div>

            {/* Action Buttons & User Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* PWA Install Button */}
              {!isInstalled && (
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-300 rounded-lg transition-all shadow-2xs animate-pulse"
                  title="Install Shree Sai Classes App on this device"
                >
                  <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="inline">Install <span className="hidden sm:inline">App</span></span>
                </button>
              )}

              {/* Import Excel */}
              <button
                onClick={onImportExcel}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-2xs transition-all active:scale-95"
                title="Import students from Excel"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                <span className="hidden md:inline">Import Excel</span>
              </button>

              {/* Export Ledger */}
              <button
                onClick={onExportExcel}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-2xs transition-all active:scale-95"
                title="Export complete fee ledger to Excel"
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-700" />
                <span className="hidden lg:inline">Export</span>
              </button>

              {/* Settings (Admin / Director) */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={onOpenSettings}
                  className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200 active:scale-95"
                  title="Institute Settings"
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}

              {/* New Student Admission Button */}
              <button
                onClick={onNewStudent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-850 hover:to-blue-750 active:scale-95 shadow-md shadow-blue-950/20 rounded-xl transition-all border border-blue-950"
              >
                <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400" />
                <span className="inline">New <span className="hidden sm:inline">Student</span></span>
              </button>

              {/* Teacher Profile & Logout */}
              {currentUser && (
                <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-200 gap-1.5 sm:gap-2">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-blue-800 font-semibold">
                      {currentUser.section === 'school'
                        ? '6th - 10th'
                        : currentUser.section === 'college'
                        ? '11th & 12th'
                        : 'Admin'}
                    </span>
                  </div>

                  <button
                    onClick={onLogout}
                    className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all active:scale-95"
                    title="Sign Out of Teacher Portal"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* PWA Install Guide Modal (For iOS / Desktop Browser Help) */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 relative">
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white p-0.5 flex items-center justify-center border-2 border-red-600 shadow-md overflow-hidden shrink-0">
                <img src="/logo.png" alt="Shree Sai Classes" className="h-full w-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Install Shree Sai App</h3>
                <p className="text-xs text-slate-500">Access offline & open from home screen</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-900">1.</span>
                    <span>Tap the <strong>Share</strong> button <Share className="inline h-3.5 w-3.5 text-blue-700 mx-0.5" /> in Safari browser bar.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-900">2.</span>
                    <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-900">3.</span>
                    <span>Tap <strong>Add</strong> at top right to install!</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-900">1.</span>
                    <span>Tap the <strong>three dots menu (⋮)</strong> at top/bottom right of your browser.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-900">2.</span>
                    <span>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-900">3.</span>
                    <span>Confirm by clicking <strong>Install</strong>.</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
