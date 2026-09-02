import React, { useState, useEffect } from 'react';
import { X, Building2, Plus, Trash2 } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose, settings, onSaveSettings }) => {
  const [formData, setFormData] = useState({
    instituteName: 'SHREE SAI CLASSES',
    tagline: 'A Choice of Better Life...! | Hard Work + Quality = Success',
    address: 'Shiv Dham Society No. 5, Opp. BMC Colony, M. D. Nagar, Nallasopara (E)',
    phone: '+91 7378756695 / +91 7378756653',
    email: '',
    website: 'www.shreesaiclasses.edu.in',
    receiptPrefix: 'SSC-REC',
    terms: [],
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        ...settings,
        terms: settings.terms || [],
      });
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleTermChange = (idx, val) => {
    const updated = [...formData.terms];
    updated[idx] = val;
    setFormData({ ...formData, terms: updated });
  };

  const handleAddTerm = () => {
    setFormData({
      ...formData,
      terms: [...formData.terms, `${formData.terms.length + 1}. New policy term`],
    });
  };

  const handleRemoveTerm = (idx) => {
    setFormData({
      ...formData,
      terms: formData.terms.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-900" />
            <h2 className="text-base font-black text-slate-900 font-heading">
              Institute Branding & Receipt Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Institute Display Name</label>
            <input
              type="text"
              value={formData.instituteName}
              onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tagline / Subheading</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Address on Receipt</label>
            <textarea
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Student's Care Helpline Number(s)</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
            />
          </div>

          {/* Terms & Conditions */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-700">Receipt Terms & Conditions</label>
              <button
                type="button"
                onClick={handleAddTerm}
                className="text-[11px] font-bold text-blue-900 hover:underline inline-flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" /> Add Term
              </button>
            </div>

            <div className="space-y-2">
              {formData.terms.map((term, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => handleTermChange(idx, e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTerm(idx)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-md"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
