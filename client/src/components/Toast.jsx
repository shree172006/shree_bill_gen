import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-600 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-300 bg-emerald-50/95 text-emerald-950',
    error: 'border-red-300 bg-red-50/95 text-red-950',
    info: 'border-blue-300 bg-blue-50/95 text-blue-950',
  };

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-200">
      <div
        className={`p-4 rounded-xl border shadow-xl backdrop-blur-md flex items-start gap-3 ${
          borderColors[toast.type || 'info']
        }`}
      >
        {icons[toast.type || 'info']}
        <div className="flex-1 min-w-0">
          {toast.title && <h5 className="text-xs font-black uppercase tracking-wider mb-0.5">{toast.title}</h5>}
          <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
