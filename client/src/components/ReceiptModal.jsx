import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  GraduationCap,
  Loader2,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from '../utils/formatters';

export const ReceiptModal = ({ isOpen, onClose, student, settings }) => {
  const receiptRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !student) return null;

  const paidInstallments = (student.installments || []).filter(
    (i) => i.status === 'PAID'
  );

  const handlePrint = () => {
    window.print();
  };

  const generatePDFBlob = async () => {
    if (!receiptRef.current) return null;
    const element = receiptRef.current;

    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const margin = 10;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);

    return {
      blob: pdf.output('blob'),
      pdfInstance: pdf,
      fileName: `Fee_Receipt_${student.receiptNo || student.studentName}.pdf`,
    };
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      const result = await generatePDFBlob();
      if (result) {
        result.pdfInstance.save(result.fileName);
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSharePDF = async () => {
    try {
      setIsGenerating(true);
      const result = await generatePDFBlob();
      if (!result) return;

      const pdfFile = new File([result.blob], result.fileName, {
        type: 'application/pdf',
      });

      // If mobile browser supports direct file sharing (Android / iOS)
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: `Fee Receipt - ${student.studentName}`,
          text: `Official Fee Receipt for ${student.studentName} (${settings?.instituteName || 'Shree Sai Classes'})`,
        });
      } else {
        // Fallback for desktop: save PDF & open WhatsApp
        result.pdfInstance.save(result.fileName);
        handleWhatsAppTextShare();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
        handleWhatsAppTextShare();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppTextShare = () => {
    const text = `*OFFICIAL FEE RECEIPT - ${settings?.instituteName || 'SHREE SAI CLASSES'}*\n\nStudent: *${student.studentName}*\nReceipt No: *${student.receiptNo}*\nCourse: ${student.courseName}\nTotal Fees: ${formatCurrency(student.grandTotal)}\nAmount Paid: ${formatCurrency(student.totalPaid)}\n*Outstanding Balance: ${formatCurrency(student.balanceLeft)}*\nStatus: *${student.status}*\n\n_Thank you for choosing Shree Sai Classes!_`;
    const cleanPhone = (student.contactNo || student.parentContact || '').replace(/[^0-9]/g, '');

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const whatsappUrl = cleanPhone
      ? isMobile
        ? `whatsapp://send?phone=91${cleanPhone}&text=${encodeURIComponent(text)}`
        : `https://web.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(text)}`
      : isMobile
      ? `whatsapp://send?text=${encodeURIComponent(text)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    const fallbackUrl = cleanPhone
      ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    try {
      window.location.href = whatsappUrl;
      setTimeout(() => {
        window.open(fallbackUrl, '_blank');
      }, 500);
    } catch (_) {
      window.open(fallbackUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150 my-auto">
        {/* Modal Controls Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-100 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">Fee Receipt Preview</span>
            <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {student.receiptNo}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Share PDF directly to WhatsApp / Mobile Apps */}
            <button
              onClick={handleSharePDF}
              disabled={isGenerating}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
              title="Share PDF Receipt directly to WhatsApp / Mobile Apps"
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
              <span>Share PDF</span>
            </button>

            {/* Direct WhatsApp Chat */}
            <button
              onClick={handleWhatsAppTextShare}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors active:scale-95"
              title="Open WhatsApp Chat with Bill Summary"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Save PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
              title="Download PDF Receipt"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Save PDF</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-2xs active:scale-95"
              title="Print Receipt"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors ml-1 active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-3 sm:p-6 overflow-y-auto bg-slate-100 flex-1">
          <div
            id="printable-receipt"
            ref={receiptRef}
            className="bg-white max-w-2xl mx-auto p-5 sm:p-7 rounded-xl border border-slate-300 shadow-md font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 relative text-xs"
          >
            {/* Academy Crest & Header Banner */}
            <div className="flex items-start justify-between border-b-2 border-blue-950 pb-4 mb-4 gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-14 w-14 rounded-xl bg-blue-950 p-1 flex items-center justify-center border-2 border-red-600 shadow-md shrink-0">
                  <GraduationCap className="h-9 w-9 text-amber-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-blue-950 font-heading tracking-tight leading-none">
                    {settings?.instituteName || 'SHREE SAI CLASSES'}
                  </h1>
                  <p className="text-xs font-bold text-red-600 mt-1">
                    {settings?.tagline || 'A Choice of Better Life...! | Hard Work + Quality = Success'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {settings?.address || 'Shiv Dham Society No. 5, Opp. BMC Colony, M. D. Nagar, Nallasopara (E)'}
                  </p>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                    Student's Care No.: {settings?.phone || '+91 7378756695 / +91 7378756653'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded shadow-xs">
                  FEE RECEIPT
                </span>
                <p className="text-xs font-mono font-bold text-blue-950 mt-1.5">
                  {student.receiptNo}
                </p>
              </div>
            </div>

            {/* Receipt Meta Date Header */}
            <div className="flex items-center justify-between text-xs text-slate-600 mb-4 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500">Admission Date: </span>
                <span className="font-bold text-slate-800">{formatDate(student.admissionDate)}</span>
              </div>
              <div>
                <span className="text-slate-500">Receipt Issue Date: </span>
                <span className="font-bold text-slate-800">{formatDate(new Date())}</span>
              </div>
            </div>

            {/* Student & Course Details Grid */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5">
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Student Full Name</span>
                  <span className="text-sm font-black text-blue-950">{student.studentName}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Academic Year</span>
                  <span className="font-bold text-slate-900 text-xs">{student.academicYear || '2024-25'}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Standard / Class</span>
                  <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 inline-block mt-0.5 text-xs">
                    {student.standard}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact Number</span>
                  <span className="font-bold text-slate-900 text-xs">{student.contactNo || student.parentContact || '-'}</span>
                </div>

                <div className="col-span-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Course & Subject Package</span>
                  <span className="font-bold text-slate-900 text-xs">{student.courseName}</span>
                </div>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="mb-5">
              <div className="bg-blue-950 text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg flex justify-between">
                <span>Fee Particulars</span>
                <span>Amount (₹)</span>
              </div>
              <div className="border-x border-b border-slate-200 divide-y divide-slate-100 text-xs rounded-b-lg overflow-hidden bg-white">
                <div className="flex justify-between px-3.5 py-2.5">
                  <span className="font-medium text-slate-700">Course Tuition & Study Material Fees</span>
                  <span className="font-bold text-slate-900">{formatCurrency(student.totalFees)}</span>
                </div>
                {student.discount > 0 && (
                  <div className="flex justify-between px-3.5 py-2 bg-emerald-50/60">
                    <span className="font-semibold text-emerald-800">Special Scholarship / Discount Concession</span>
                    <span className="font-bold text-emerald-700">- {formatCurrency(student.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between px-3.5 py-2.5 bg-slate-100 font-bold text-slate-900">
                  <span>Net Payable Grand Total</span>
                  <span className="text-sm font-black text-blue-950">{formatCurrency(student.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Paid Installments Payment Table (ONLY PAID RECORDS) */}
            <div className="mb-5">
              <div className="bg-slate-800 text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg flex justify-between items-center">
                <span>Payment & Receipts Breakdown</span>
                <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {paidInstallments.length} Payment(s) Cleared
                </span>
              </div>
              <div className="border-x border-b border-slate-200 rounded-b-lg overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2">Installment</th>
                      <th className="px-3.5 py-2">Payment Date</th>
                      <th className="px-3.5 py-2">Payment Mode</th>
                      <th className="px-3.5 py-2 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paidInstallments.length > 0 ? (
                      paidInstallments.map((inst, idx) => (
                        <tr key={idx} className="bg-emerald-50/30">
                          <td className="px-3.5 py-2.5 font-bold text-slate-800">
                            Installment #{inst.srNo}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-700 font-medium">
                            {formatDate(inst.paidDate || inst.dueDate)}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-800 font-semibold">
                            {inst.paymentMode || 'Cash'}
                            {inst.transactionDetails && inst.transactionDetails !== 'Cash' && inst.transactionDetails !== 'Counter Payment' && (
                              <span className="block text-[10px] text-slate-500 font-normal">
                                {inst.transactionDetails}
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-black text-emerald-700">
                            {formatCurrency(inst.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-3.5 py-4 text-center text-slate-400 font-medium italic">
                          No payments cleared yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Collected & Outstanding Balance Due Box */}
            <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 p-4 rounded-xl border border-slate-300 flex items-center justify-between mb-5 text-xs">
              <div>
                <span className="block text-[11px] font-bold uppercase text-slate-500">Total Fees Collected</span>
                <span className="text-lg font-black text-emerald-700">{formatCurrency(student.totalPaid)}</span>
              </div>
              <div className="text-right">
                <span className="block text-[11px] font-bold uppercase text-slate-500">Outstanding Balance Due</span>
                <span
                  className={`text-lg font-black ${
                    student.balanceLeft > 0 ? 'text-red-700' : 'text-emerald-600'
                  }`}
                >
                  {formatCurrency(student.balanceLeft)}
                </span>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-6 text-[10px] text-slate-500 space-y-1 border-t border-slate-200 pt-3">
              <p className="font-bold text-slate-700 uppercase tracking-wider mb-1">Terms & Conditions:</p>
              {(settings?.terms || [
                '1. The receipt is subject to realisation of payment.',
                '2. This receipt should be carefully preserved and must be produced on demand.',
                '3. Fees once paid are strictly non-refundable and non-transferable under any circumstances.',
              ]).map((term, i) => (
                <p key={i}>{term}</p>
              ))}
            </div>

            {/* Signature Block */}
            <div className="flex justify-end pt-6 border-t border-dashed border-slate-300 text-xs">
              <div className="text-center">
                <div className="text-[10px] font-bold text-blue-950 uppercase tracking-wider mb-8">
                  For {settings?.instituteName || 'SHREE SAI CLASSES'}
                </div>
                <div className="w-44 border-b border-slate-400 mb-1" />
                <span className="text-[11px] font-bold text-slate-600">Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
