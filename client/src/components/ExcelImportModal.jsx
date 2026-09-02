import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { excelAPI } from '../services/api';

export const ExcelImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError('');
      setSuccessMsg('');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await excelAPI.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Shree_Sai_Classes_Student_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download Excel template.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await excelAPI.uploadExcel(formData);
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Import successful!');
        setTimeout(() => {
          onImportSuccess();
          onClose();
        }, 1200);
      } else {
        setError(res.data.message || 'Import failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing Excel file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 font-heading">
                Import Students from Excel
              </h2>
              <p className="text-xs text-slate-500">Bulk sync student fees and installment schedules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Template helper */}
        <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
          <div className="text-xs">
            <span className="block font-bold text-blue-950">Standard Excel Template</span>
            <span className="text-blue-800">Download formatted columns with sample data</span>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-900 bg-white hover:bg-blue-100 border border-blue-300 rounded-lg shadow-sm transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Template</span>
          </button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="mt-5 space-y-4">
          <label className="border-2 border-dashed border-slate-300 hover:border-blue-700 bg-slate-50 hover:bg-blue-50/40 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors block text-center">
            <Upload className="h-8 w-8 text-blue-800 mb-2" />
            <span className="text-sm font-bold text-slate-700">
              {file ? file.name : 'Click to select Excel file'}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">Supports .xlsx, .xls, and .csv files</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50 rounded-xl shadow-md transition-all"
            >
              {uploading ? 'Processing Sheet...' : 'Upload & Sync Records'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
