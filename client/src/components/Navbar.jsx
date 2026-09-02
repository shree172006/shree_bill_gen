import React from 'react';
import {
  GraduationCap,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Settings,
} from 'lucide-react';

export const Navbar = ({
  onNewStudent,
  onImportExcel,
  onExportExcel,
  onOpenSettings,
  settings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Crest Monogram */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="h-9 w-9 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-gradient-to-tr from-blue-900 via-blue-800 to-blue-700 p-0.5 shadow-md flex items-center justify-center border-2 border-red-600">
              <GraduationCap className="h-5 w-5 sm:h-7 sm:w-7 text-amber-300" />
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
                {settings?.tagline || 'Automated Billing & Fee Receipt Console'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
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

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200 active:scale-95"
              title="Institute Settings"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* New Student Admission Button */}
            <button
              onClick={onNewStudent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-850 hover:to-blue-750 active:scale-95 shadow-md shadow-blue-950/20 rounded-xl transition-all border border-blue-950"
            >
              <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400" />
              <span className="inline">New <span className="hidden sm:inline">Student</span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
