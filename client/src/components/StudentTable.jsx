import React from 'react';
import {
  Search,
  Filter,
  Receipt,
  Edit2,
  Trash2,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export const StudentTable = ({
  students,
  loading,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  standardFilter,
  onStandardFilterChange,
  onViewReceipt,
  onEditStudent,
  onDeleteStudent,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            PAID
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="h-3 w-3 text-amber-600" />
            PARTIAL
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="h-3 w-3 text-red-600" />
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
      {/* Responsive Controls Toolbar */}
      <div className="p-3.5 sm:p-5 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full max-w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, mobile, course, receipt..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition-all placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-2 text-xs sm:text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 shadow-2xs text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="PAID">Fully Paid</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="PENDING">Pending (Unpaid)</option>
            </select>
          </div>

          {/* Standard Filter */}
          <select
            value={standardFilter}
            onChange={(e) => onStandardFilterChange(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-2 text-xs sm:text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 shadow-2xs text-slate-700 font-medium"
          >
            <option value="all">All Standards & Boards</option>
            <optgroup label="Junior College (Commerce Stream Only)">
              <option value="SYJC">SYJC (12th Commerce)</option>
              <option value="FYJC">FYJC (11th Commerce)</option>
            </optgroup>
            <optgroup label="School Section (CBSE / ICSE / IGCSE / SSC)">
              <option value="Class 10">Class 10 (10th)</option>
              <option value="Class 9">Class 9 (9th)</option>
              <option value="Class 8">Class 8 (8th)</option>
              <option value="Class 7">Class 7 (7th)</option>
              <option value="Class 6">Class 6 (6th)</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="px-6 py-12 text-center text-slate-500 font-medium">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-900 border-t-transparent mb-2" />
          <p className="text-xs sm:text-sm">Loading student records...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && students.length === 0 && (
        <div className="px-6 py-12 text-center text-slate-500 font-medium">
          <div className="max-w-xs mx-auto">
            <p className="text-base font-bold text-slate-700 mb-1">No Student Records Found</p>
            <p className="text-xs text-slate-400">Add a new admission or import via Excel spreadsheet.</p>
          </div>
        </div>
      )}

      {/* 📱 MOBILE CARD VIEW (Visible on mobile/tablet < md breakpoint) */}
      {!loading && students.length > 0 && (
        <div className="block md:hidden divide-y divide-slate-100">
          {students.map((student) => {
            const paidCount = (student.installments || []).filter((i) => i.status === 'PAID').length;
            const totalCount = (student.installments || []).length;
            const progressPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

            return (
              <div key={student.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                {/* Header: Student Name + Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{student.studentName}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {student.receiptNo || 'SSC-REC-000'}
                      </span>
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                        {student.standard}
                      </span>
                    </div>
                  </div>
                  <div>{getStatusBadge(student.status)}</div>
                </div>

                {/* Course & Contact */}
                <p className="text-xs text-slate-600 font-medium truncate mb-2">{student.courseName}</p>
                {student.contactNo && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{student.contactNo}</span>
                  </div>
                )}

                {/* 3-Column Financial Summary Grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-2.5 text-center">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-500">Total</span>
                    <span className="text-xs font-black text-slate-900">{formatCurrency(student.grandTotal)}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-emerald-600">Paid</span>
                    <span className="text-xs font-black text-emerald-700">{formatCurrency(student.totalPaid)}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-red-500">Due</span>
                    <span className={`text-xs font-black ${student.balanceLeft > 0 ? 'text-red-700' : 'text-slate-400'}`}>
                      {formatCurrency(student.balanceLeft)}
                    </span>
                  </div>
                </div>

                {/* Installment Progress */}
                {totalCount > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                      <span>Installments: {paidCount}/{totalCount} Paid</span>
                      <span>{progressPercent}% Cleared</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          student.balanceLeft === 0 ? 'bg-emerald-500' : 'bg-blue-800'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 1-Tap Touch Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => onViewReceipt(student)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-blue-950 bg-blue-50 hover:bg-blue-100 active:scale-95 border border-blue-200 rounded-lg transition-all"
                  >
                    <Receipt className="h-3.5 w-3.5 text-blue-800" />
                    <span>View Bill</span>
                  </button>

                  <button
                    onClick={() => onEditStudent(student)}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-200 rounded-lg transition-all"
                    title="Edit Student"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteStudent(student.id)}
                    className="p-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 active:scale-95 border border-red-200 rounded-lg transition-all"
                    title="Delete Student"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 💻 DESKTOP TABLE VIEW (Visible on screens >= md breakpoint) */}
      {!loading && students.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100/80 text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Reg No.</th>
                <th className="px-4 py-3.5">Name of Student</th>
                <th className="px-3 py-3.5">Std</th>
                <th className="px-4 py-3.5">Date Of Admission</th>
                <th className="px-4 py-3.5 text-right">Actual Fees</th>
                <th className="px-4 py-3.5 text-right">Total Paid</th>
                <th className="px-4 py-3.5 text-right">Pending</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((student) => {
                const paidCount = (student.installments || []).filter((i) => i.status === 'PAID').length;
                const totalCount = (student.installments || []).length;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Reg No */}
                    <td className="px-4 py-3.5">
                      <span className="block font-bold text-blue-950 text-xs font-mono">
                        {student.receiptNo || 'SSC-REC-000'}
                      </span>
                    </td>

                    {/* Student Name */}
                    <td className="px-4 py-3.5">
                      <span className="block font-bold text-slate-900 text-sm">
                        {student.studentName}
                      </span>
                      {student.contactNo && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {student.contactNo}
                        </span>
                      )}
                    </td>

                    {/* Std */}
                    <td className="px-3 py-3.5">
                      <span className="inline-block px-2 py-0.5 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded-md">
                        {student.standard}
                      </span>
                    </td>

                    {/* Date Of Admission */}
                    <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">
                      {formatDate(student.admissionDate)}
                    </td>

                    {/* Actual Fees */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(student.grandTotal)}
                      </span>
                      {student.discount > 0 && (
                        <span className="block text-[10px] text-emerald-600 font-medium">
                          Disc: -{formatCurrency(student.discount)}
                        </span>
                      )}
                    </td>

                    {/* Total Paid */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(student.totalPaid)}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-medium">
                        {paidCount}/{totalCount} Inst.
                      </span>
                    </td>

                    {/* Pending Balance */}
                    <td className="px-4 py-3.5 text-right">
                      <span
                        className={`font-black ${
                          student.balanceLeft > 0 ? 'text-red-700' : 'text-slate-400'
                        }`}
                      >
                        {formatCurrency(student.balanceLeft)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-3.5 text-center">
                      {getStatusBadge(student.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Receipt Action */}
                        <button
                          onClick={() => onViewReceipt(student)}
                          className="p-1.5 text-blue-900 hover:bg-blue-50 border border-blue-200 hover:border-blue-400 rounded-lg transition-colors"
                          title="Generate & View Fee Receipt"
                        >
                          <Receipt className="h-4 w-4 text-blue-800" />
                        </button>

                        {/* Edit Action */}
                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                          title="Edit Student & Installments"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Delete Action */}
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
