import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { DateInput } from './DateInput';
import { formatCurrency } from '../utils/formatters';

export const StudentModal = ({ isOpen, onClose, onSave, student }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    rollNo: '',
    contactNo: '',
    parentContact: '',
    standard: 'SYJC (12th Commerce)',
    board: 'HSC',
    courseName: 'SYJC - COMMERCE (BK, Accounts, Maths, Eco, OCM)',
    academicYear: '2024-25',
    admissionDate: new Date().toISOString().split('T')[0],
    totalFees: 45000,
    discount: 0,
    installments: [],
    notes: '',
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        installments: student.installments || [],
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        studentName: '',
        rollNo: '',
        contactNo: '',
        parentContact: '',
        standard: 'SYJC',
        courseName: 'SYJC - COMMERCE (2024-25)',
        academicYear: '2024-25',
        admissionDate: today,
        totalFees: 45000,
        discount: 0,
        installments: [
          {
            srNo: 1,
            dueDate: today,
            paidDate: today,
            status: 'PAID',
            amount: 15000,
            paymentMode: 'Cash',
            transactionDetails: 'Cash',
          },
          {
            srNo: 2,
            dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
            status: 'PENDING',
            amount: 15000,
            paymentMode: '',
            transactionDetails: '',
          },
          {
            srNo: 3,
            dueDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
            status: 'PENDING',
            amount: 15000,
            paymentMode: '',
            transactionDetails: '',
          },
        ],
        notes: '',
      });
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const totalFees = parseFloat(formData.totalFees || 0);
  const discount = parseFloat(formData.discount || 0);
  const grandTotal = Math.max(0, totalFees - discount);

  const totalPaid = (formData.installments || []).reduce(
    (acc, i) => (i.status === 'PAID' ? acc + parseFloat(i.amount || 0) : acc),
    0
  );
  const balanceLeft = Math.max(0, grandTotal - totalPaid);

  // Auto split installments equally
  const handleAutoSplit = (count) => {
    const n = Math.max(1, parseInt(count || 1, 10));
    const perInst = Math.floor(grandTotal / n);
    const remainder = grandTotal - perInst * n;
    const today = new Date();

    const newInst = [];
    for (let i = 0; i < n; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i * 30);
      const amt = i === n - 1 ? perInst + remainder : perInst;

      newInst.push({
        srNo: i + 1,
        dueDate: d.toISOString().split('T')[0],
        status: i === 0 ? 'PAID' : 'PENDING',
        paidDate: i === 0 ? today.toISOString().split('T')[0] : '',
        amount: amt,
        paymentMode: i === 0 ? 'Cash' : '',
        transactionDetails: i === 0 ? 'Cash counter payment' : '',
      });
    }

    setFormData({ ...formData, installments: newInst });
  };

  const handleInstallmentChange = (idx, field, val) => {
    const updated = [...formData.installments];
    updated[idx] = { ...updated[idx], [field]: val };

    if (field === 'status' && val === 'PAID' && !updated[idx].paidDate) {
      updated[idx].paidDate = new Date().toISOString().split('T')[0];
      if (!updated[idx].paymentMode) updated[idx].paymentMode = 'Cash';
    }

    setFormData({ ...formData, installments: updated });
  };

  const handleAddInstallment = () => {
    const d = new Date();
    d.setDate(d.getDate() + (formData.installments.length + 1) * 30);
    setFormData({
      ...formData,
      installments: [
        ...formData.installments,
        {
          srNo: formData.installments.length + 1,
          dueDate: d.toISOString().split('T')[0],
          status: 'PENDING',
          amount: 5000,
          paymentMode: '',
          transactionDetails: '',
        },
      ],
    });
  };

  const handleRemoveInstallment = (idx) => {
    const updated = formData.installments
      .filter((_, i) => i !== idx)
      .map((item, i) => ({ ...item, srNo: i + 1 }));
    setFormData({ ...formData, installments: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentName.trim()) {
      setFormError('Please enter the student full name');
      return;
    }
    setFormError('');
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-950 to-blue-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight font-heading">
              {student ? 'Edit Student & Installments' : 'New Student Admission Console'}
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Set up tuition fees, scholarship concessions, and dynamic installment splits
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {formError && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-xs font-bold text-red-700">
            ⚠️ {formError}
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* Personal & Academic Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Student & Academic Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shreyas Chavan"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Standard / Class *</label>
                <select
                  value={formData.standard}
                  onChange={(e) => {
                    const std = e.target.value;
                    let autoCourse = formData.courseName;
                    if (std.includes('SYJC')) {
                      autoCourse = 'SYJC - COMMERCE (BK, Accounts, Maths, Eco, OCM)';
                    } else if (std.includes('FYJC')) {
                      autoCourse = 'FYJC - COMMERCE (BK, Accounts, Maths, Eco, OCM)';
                    } else {
                      autoCourse = `${std} - CBSE / ICSE / SSC (Maths & Science Package)`;
                    }
                    setFormData({ ...formData, standard: std, courseName: autoCourse });
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none font-medium"
                >
                  <optgroup label="Junior College (Commerce Stream Only)">
                    <option value="SYJC (12th Commerce)">SYJC (12th Commerce)</option>
                    <option value="FYJC (11th Commerce)">FYJC (11th Commerce)</option>
                  </optgroup>
                  <optgroup label="Secondary & High School (6th to 10th)">
                    <option value="Class 10">Class 10 (10th)</option>
                    <option value="Class 9">Class 9 (9th)</option>
                    <option value="Class 8">Class 8 (8th)</option>
                    <option value="Class 7">Class 7 (7th)</option>
                    <option value="Class 6">Class 6 (6th)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Education Board</label>
                <select
                  value={formData.board || 'CBSE'}
                  onChange={(e) => {
                    const board = e.target.value;
                    setFormData({ ...formData, board });
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none font-medium"
                >
                  <option value="CBSE">CBSE Board</option>
                  <option value="ICSE">ICSE Board</option>
                  <option value="IGCSE">IGCSE (Cambridge)</option>
                  <option value="SSC">SSC (Maharashtra State Board)</option>
                  <option value="HSC">HSC (Commerce - Maharashtra Board)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Course & Package Title *</label>
                <input
                  type="text"
                  placeholder="e.g. SYJC - COMMERCE (BK, Accounts, Maths, Eco, OCM)"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  placeholder="2024-25"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Mobile</label>
                <input
                  type="text"
                  placeholder="98XXXXXXXX"
                  value={formData.contactNo}
                  onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parent Mobile</label>
                <input
                  type="text"
                  placeholder="98XXXXXXXX"
                  value={formData.parentContact}
                  onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admission Date (DD/MM/YYYY)</label>
                <DateInput
                  value={formData.admissionDate}
                  onChange={(val) => setFormData({ ...formData, admissionDate: val })}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Financials & Quick Split */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              2. Financial Fee Setup & Grand Total
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gross Course Fees (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalFees}
                  onChange={(e) => setFormData({ ...formData, totalFees: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scholarship / Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-bold text-emerald-700 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:outline-none"
                />
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-300 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Net Payable Grand Total</span>
                <span className="text-xl font-black text-blue-950">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Quick Auto Split Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Quick Split Installments:</span>
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleAutoSplit(num)}
                  className="px-2.5 py-1 text-xs font-bold text-blue-900 bg-white hover:bg-blue-100 border border-blue-300 rounded-md transition-colors shadow-2xl"
                >
                  {num} {num === 1 ? 'Lump Sum' : 'Inst.'}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Installments Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Installments Schedule & Payment Status
              </h3>
              <button
                type="button"
                onClick={handleAddInstallment}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {formData.installments.map((inst, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-colors ${
                    inst.status === 'PAID'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-xs font-black text-slate-500 w-6">#{inst.srNo}</span>

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
                    {/* Amount */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={inst.amount}
                        onChange={(e) => handleInstallmentChange(idx, 'amount', e.target.value)}
                        className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded focus:ring-1 focus:ring-blue-800"
                      />
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Due Date (DD/MM/YYYY)</label>
                      <DateInput
                        value={inst.dueDate}
                        onChange={(val) => handleInstallmentChange(idx, 'dueDate', val)}
                        className="px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-800 bg-white"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Status</label>
                      <select
                        value={inst.status}
                        onChange={(e) => handleInstallmentChange(idx, 'status', e.target.value)}
                        className={`w-full px-2 py-1 text-xs font-bold border rounded focus:ring-1 ${
                          inst.status === 'PAID'
                            ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                            : 'text-red-700 bg-red-50 border-red-200'
                        }`}
                      >
                        <option value="PAID">PAID</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                    </div>

                    {/* Paid Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Paid Date (DD/MM/YYYY)</label>
                      <DateInput
                        value={inst.paidDate || ''}
                        onChange={(val) => handleInstallmentChange(idx, 'paidDate', val)}
                        className={`px-2 py-1 text-xs border border-slate-300 rounded ${
                          inst.status !== 'PAID' ? 'bg-slate-100 opacity-60 pointer-events-none' : 'bg-white'
                        }`}
                      />
                    </div>

                    {/* Payment Mode */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Payment Mode</label>
                      <select
                        disabled={inst.status !== 'PAID'}
                        value={inst.paymentMode || 'Cash'}
                        onChange={(e) => handleInstallmentChange(idx, 'paymentMode', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded disabled:bg-slate-100"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI / GPay</option>
                        <option value="Net Banking">Net Banking</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveInstallment(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors self-end sm:self-center"
                    title="Remove installment row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary Bar */}
            <div className="mt-4 p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-4">
                <span>Total Paid: <span className="text-emerald-700">{formatCurrency(totalPaid)}</span></span>
                <span>Balance Left: <span className="text-red-700">{formatCurrency(balanceLeft)}</span></span>
              </div>
              <span className={`px-2 py-0.5 rounded-full ${balanceLeft === 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                {balanceLeft === 0 ? 'Fully Cleared' : 'Installments Due'}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 active:scale-95 rounded-xl shadow-md transition-all"
          >
            {student ? 'Update Student Record' : 'Save Admission'}
          </button>
        </div>
      </div>
    </div>
  );
};
