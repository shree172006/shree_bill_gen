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

  const buildReceiptHTML = () => {
    const inst = paidInstallments;
    const todayStr = formatDate(new Date());
    const admDate = formatDate(student.admissionDate);
    const instituteName = settings?.instituteName || 'SHREE SAI CLASSES';
    const tagline = settings?.tagline || 'A Choice of Better Life...! | Hard Work + Quality = Success';
    const address = settings?.address || 'Shiv Dham Society No. 5, Opp. BMC Colony, M. D. Nagar, Nallasopara (E)';
    const phone = settings?.phone || '+91 7378756695 / +91 7378756653';
    const terms = settings?.terms || [
      '1. The receipt is subject to realisation of payment.',
      '2. This receipt should be carefully preserved and must be produced on demand.',
      '3. Fees once paid are strictly non-refundable and non-transferable under any circumstances.',
    ];

    const rowsHTML = inst.length > 0
      ? inst.map((i, idx) => `
          <tr style="background:${idx % 2 === 0 ? '#f0fdf4' : '#ffffff'}">
            <td style="padding:7px 10px;font-weight:700;color:#1e293b;font-size:11px;border-bottom:1px solid #e2e8f0">Installment</td>
            <td style="padding:7px 10px;color:#475569;font-size:11px;border-bottom:1px solid #e2e8f0">${formatDate(i.paidDate || i.dueDate)}</td>
            <td style="padding:7px 10px;color:#1e293b;font-weight:600;font-size:11px;border-bottom:1px solid #e2e8f0">${i.paymentMode || 'Cash'}</td>
            <td style="padding:7px 10px;text-align:right;font-weight:900;color:#15803d;font-size:11px;border-bottom:1px solid #e2e8f0">${formatCurrency(i.amount)}</td>
          </tr>`).join('')
      : `<tr><td colspan="4" style="padding:14px;text-align:center;color:#94a3b8;font-style:italic;font-size:11px">No payments cleared yet.</td></tr>`;

    const discountRow = student.discount > 0
      ? `<div style="display:flex;justify-content:space-between;padding:8px 12px;background:#ecfdf5;border-bottom:1px solid #e2e8f0">
           <span style="font-weight:600;color:#065f46;font-size:11px">Special Scholarship / Discount Concession</span>
           <span style="font-weight:700;color:#059669;font-size:11px">- ${formatCurrency(student.discount)}</span>
         </div>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1e293b;font-size:12px;line-height:1.4}
  h1{font-size:22px;font-weight:900;color:#172554;letter-spacing:-0.5px}
</style>
</head>
<body style="padding:28px 32px;width:800px">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #172554;padding-bottom:14px;margin-bottom:14px">
    <div style="display:flex;align-items:flex-start;gap:14px">
      <div style="width:52px;height:52px;background:#172554;border-radius:10px;border:2px solid #dc2626;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <div>
        <h1>${instituteName}</h1>
        <p style="font-size:11px;font-weight:700;color:#dc2626;margin-top:3px">${tagline}</p>
        <p style="font-size:10px;color:#64748b;margin-top:3px">${address}</p>
        <p style="font-size:10px;font-weight:600;color:#475569;margin-top:2px">Student's Care No.: ${phone}</p>
      </div>
    </div>
    <div style="text-align:right;flex-shrink:0">
      <div style="background:#dc2626;color:#fff;font-weight:900;font-size:11px;letter-spacing:1px;padding:4px 10px;border-radius:4px;text-transform:uppercase">FEE RECEIPT</div>
      <p style="font-size:12px;font-weight:700;font-family:monospace;color:#172554;margin-top:5px">${student.receiptNo}</p>
    </div>
  </div>

  <!-- Dates -->
  <div style="display:flex;justify-content:space-between;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 14px;margin-bottom:14px;font-size:11px;color:#475569">
    <div><span>Admission Date: </span><strong style="color:#1e293b">${admDate}</strong></div>
    <div><span>Receipt Issue Date: </span><strong style="color:#1e293b">${todayStr}</strong></div>
  </div>

  <!-- Student Details -->
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:14px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:2px">Student Full Name</div>
        <div style="font-size:13px;font-weight:900;color:#172554">${student.studentName}</div>
      </div>
      <div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:2px">Academic Year</div>
        <div style="font-size:12px;font-weight:700;color:#1e293b">${student.academicYear || '2026-27'}</div>
      </div>
      <div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:2px">Standard / Class</div>
        <div style="display:inline-block;background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700">${student.standard}</div>
      </div>
      <div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:2px">Contact Number</div>
        <div style="font-size:12px;font-weight:700;color:#1e293b">${student.contactNo || student.parentContact || '-'}</div>
      </div>
      <div style="grid-column:1/-1">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:2px">Course &amp; Subject Package</div>
        <div style="font-size:12px;font-weight:700;color:#1e293b">${student.courseName}</div>
      </div>
    </div>
  </div>

  <!-- Fee Particulars -->
  <div style="margin-bottom:14px">
    <div style="background:#172554;color:#fff;padding:8px 12px;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">
      <span>Fee Particulars</span><span>Amount (₹)</span>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;overflow:hidden">
      <div style="display:flex;justify-content:space-between;padding:9px 12px;border-bottom:1px solid #f1f5f9">
        <span style="font-size:11px;color:#475569">Course Tuition &amp; Study Material Fees</span>
        <span style="font-size:11px;font-weight:700;color:#1e293b">${formatCurrency(student.totalFees)}</span>
      </div>
      ${discountRow}
      <div style="display:flex;justify-content:space-between;padding:9px 12px;background:#f1f5f9">
        <span style="font-size:11px;font-weight:700;color:#1e293b">Net Payable Grand Total</span>
        <span style="font-size:13px;font-weight:900;color:#172554">${formatCurrency(student.grandTotal)}</span>
      </div>
    </div>
  </div>

  <!-- Payment Table -->
  <div style="margin-bottom:14px">
    <div style="background:#1e293b;color:#fff;padding:8px 12px;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">
      <span>Payment &amp; Receipts Breakdown</span>
      <span style="color:#6ee7b7;font-size:10px">${inst.length} Cleared</span>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;overflow:hidden">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:7px 10px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;border-bottom:1px solid #e2e8f0">Installment</th>
            <th style="padding:7px 10px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;border-bottom:1px solid #e2e8f0">Payment Date</th>
            <th style="padding:7px 10px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;border-bottom:1px solid #e2e8f0">Payment Mode</th>
            <th style="padding:7px 10px;text-align:right;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;border-bottom:1px solid #e2e8f0">Amount Paid</th>
          </tr>
        </thead>
        <tbody>${rowsHTML}</tbody>
      </table>
    </div>
  </div>

  <!-- Balance Summary -->
  <div style="display:flex;justify-content:space-between;background:linear-gradient(to right,#eff6ff,#fff,#fef2f2);border:1px solid #cbd5e1;border-radius:10px;padding:14px 18px;margin-bottom:14px">
    <div>
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:3px">Total Fees Collected</div>
      <div style="font-size:20px;font-weight:900;color:#15803d">${formatCurrency(student.totalPaid)}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:3px">Outstanding Balance Due</div>
      <div style="font-size:20px;font-weight:900;color:${student.balanceLeft > 0 ? '#b91c1c' : '#15803d'}">${formatCurrency(student.balanceLeft)}</div>
    </div>
  </div>

  <!-- Terms -->
  <div style="border-top:1px solid #e2e8f0;padding-top:10px;margin-bottom:18px">
    <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#475569;margin-bottom:4px">Terms &amp; Conditions:</p>
    ${terms.map(t => `<p style="font-size:9px;color:#64748b;line-height:1.5">${t}</p>`).join('')}
  </div>

  <!-- Signature -->
  <div style="display:flex;justify-content:flex-end;border-top:1px dashed #cbd5e1;padding-top:14px">
    <div style="text-align:center">
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#172554;margin-bottom:32px">For ${instituteName}</div>
      <div style="width:160px;border-bottom:1px solid #94a3b8;margin-bottom:5px"></div>
      <div style="font-size:10px;font-weight:700;color:#475569">Authorized Signatory</div>
    </div>
  </div>
</body>
</html>`;
  };

  const generatePDFBlob = async () => {
    // Dynamically load html2canvas & jsPDF
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    await new Promise((resolve) => setTimeout(resolve, 30));

    // Inject a hidden iframe with self-contained inline-styled HTML.
    // This approach is 100% device-independent — the PDF NEVER reflects the phone's screen width.
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    Object.assign(iframe.style, {
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      width: '800px',
      height: '1400px',
      border: 'none',
      visibility: 'hidden',
    });
    document.body.appendChild(iframe);

    let canvas;
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(buildReceiptHTML());
      iframeDoc.close();

      // Wait for iframe to finish rendering fonts / layout
      await new Promise((resolve) => setTimeout(resolve, 250));

      const body = iframeDoc.body;
      const docHeight = body.scrollHeight || 1200;

      iframe.style.height = `${docHeight + 40}px`;

      // Allow layout reflow for the new height
      await new Promise((resolve) => setTimeout(resolve, 80));

      canvas = await html2canvas(body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 800,
        windowWidth: 800,
        scrollX: 0,
        scrollY: 0,
      });
    } finally {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }

    if (!canvas) return null;

    const imgData = canvas.toDataURL('image/jpeg', 0.96);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8;
    const usableW = pageWidth - margin * 2;  // 194mm
    const usableH = pageHeight - margin * 2; // 281mm

    const renderedH = (canvas.height * usableW) / canvas.width;

    if (renderedH <= usableH) {
      // Content fits on one page — place it directly
      pdf.addImage(imgData, 'JPEG', margin, margin, usableW, renderedH);
    } else {
      // Content taller than A4: tile across multiple pages
      const pageImgH = (usableH * canvas.width) / usableW;
      let remainingH = canvas.height;
      let srcY = 0;
      let isFirstPage = true;

      while (remainingH > 0) {
        const sliceH = Math.min(pageImgH, remainingH);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceH;
        sliceCanvas.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.96);
        const sliceRenderH = (sliceH * usableW) / canvas.width;

        if (!isFirstPage) pdf.addPage();
        pdf.addImage(sliceData, 'JPEG', margin, margin, usableW, sliceRenderH);

        srcY += sliceH;
        remainingH -= sliceH;
        isFirstPage = false;
      }
    }

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
      console.error('PDF generation error:', err);
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

      // If mobile browser supports direct file sharing (WhatsApp / Chat apps)
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: `Fee Receipt - ${student.studentName}`,
          text: `Official Fee Receipt for ${student.studentName} (${settings?.instituteName || 'Shree Sai Classes'})`,
        });
      } else {
        result.pdfInstance.save(result.fileName);
        handleWhatsAppTextShare();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        handleWhatsAppTextShare();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppTextShare = () => {
    const text = `*OFFICIAL FEE RECEIPT - ${settings?.instituteName || 'SHREE SAI CLASSES'}*\n\nStudent: *${student.studentName}*\nReceipt No: *${student.receiptNo}*\nStandard: ${student.standard}\nTotal Fees: ${formatCurrency(student.grandTotal)}\nAmount Paid: ${formatCurrency(student.totalPaid)}\n*Outstanding Balance: ${formatCurrency(student.balanceLeft)}*\nStatus: *${student.status}*\n\n_Thank you for choosing Shree Sai Classes!_`;
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150 my-auto print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Controls Header (Hidden on Print) */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-100 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-xs sm:text-sm">Fee Receipt Preview</span>
            <span className="text-[11px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
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
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
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
        <div className="p-3 sm:p-5 overflow-y-auto bg-slate-100 flex-1 print:p-0 print:bg-white print:overflow-visible">
          <div
            id="printable-receipt"
            ref={receiptRef}
            className="bg-white max-w-xl mx-auto p-4 sm:p-6 rounded-xl border border-slate-300 shadow-md font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 relative text-xs print:border-none print:shadow-none print:max-w-none print:p-0"
          >
            {/* Academy Crest & Header Banner */}
            <div className="flex items-start justify-between border-b-2 border-blue-950 pb-3 mb-3 gap-3">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-950 p-1 flex items-center justify-center border-2 border-red-600 shadow-sm shrink-0">
                  <GraduationCap className="h-7 w-7 text-amber-300" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-blue-950 font-heading tracking-tight leading-none">
                    {settings?.instituteName || 'SHREE SAI CLASSES'}
                  </h1>
                  <p className="text-[11px] font-bold text-red-600 mt-0.5">
                    {settings?.tagline || 'A Choice of Better Life...! | Hard Work + Quality = Success'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    {settings?.address || 'Shiv Dham Society No. 5, Opp. BMC Colony, M. D. Nagar, Nallasopara (E)'}
                  </p>
                  <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
                    Student's Care No.: {settings?.phone || '+91 7378756695 / +91 7378756653'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-2.5 py-0.5 bg-red-600 text-white font-black text-[11px] uppercase tracking-wider rounded">
                  FEE RECEIPT
                </span>
                <p className="text-xs font-mono font-bold text-blue-950 mt-1">
                  {student.receiptNo}
                </p>
              </div>
            </div>

            {/* Receipt Meta Date Header */}
            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
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
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-3.5">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Student Full Name</span>
                  <span className="text-xs font-black text-blue-950">{student.studentName}</span>
                </div>

                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Academic Year</span>
                  <span className="font-bold text-slate-900 text-xs">{student.academicYear || '2026-27'}</span>
                </div>

                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Standard / Class</span>
                  <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 inline-block text-[11px]">
                    {student.standard}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Contact Number</span>
                  <span className="font-bold text-slate-900 text-xs">{student.contactNo || student.parentContact || '-'}</span>
                </div>

                <div className="col-span-2">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Course & Subject Package</span>
                  <span className="font-bold text-slate-900 text-xs">{student.courseName}</span>
                </div>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="mb-3.5">
              <div className="bg-blue-950 text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-t-lg flex justify-between">
                <span>Fee Particulars</span>
                <span>Amount (₹)</span>
              </div>
              <div className="border-x border-b border-slate-200 divide-y divide-slate-100 text-xs rounded-b-lg overflow-hidden bg-white">
                <div className="flex justify-between px-3 py-2">
                  <span className="font-medium text-slate-700">Course Tuition & Study Material Fees</span>
                  <span className="font-bold text-slate-900">{formatCurrency(student.totalFees)}</span>
                </div>
                {student.discount > 0 && (
                  <div className="flex justify-between px-3 py-1.5 bg-emerald-50/60">
                    <span className="font-semibold text-emerald-800">Special Scholarship / Discount Concession</span>
                    <span className="font-bold text-emerald-700">- {formatCurrency(student.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between px-3 py-2 bg-slate-100 font-bold text-slate-900">
                  <span>Net Payable Grand Total</span>
                  <span className="text-xs font-black text-blue-950">{formatCurrency(student.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Paid Installments Payment Table (ONLY PAID RECORDS) */}
            <div className="mb-3.5">
              <div className="bg-slate-800 text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-t-lg flex justify-between items-center">
                <span>Payment & Receipts Breakdown</span>
                <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {paidInstallments.length} Cleared
                </span>
              </div>
              <div className="border-x border-b border-slate-200 rounded-b-lg overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[9px] font-bold text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-1.5">Installment</th>
                      <th className="px-3 py-1.5">Payment Date</th>
                      <th className="px-3 py-1.5">Payment Mode</th>
                      <th className="px-3 py-1.5 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paidInstallments.length > 0 ? (
                      paidInstallments.map((inst, idx) => (
                        <tr key={idx} className="bg-emerald-50/30">
                          <td className="px-3 py-1.5 font-bold text-slate-800">
                            Installment
                          </td>
                          <td className="px-3 py-1.5 text-slate-700 font-medium text-[11px]">
                            {formatDate(inst.paidDate || inst.dueDate)}
                          </td>
                          <td className="px-3 py-1.5 text-slate-800 font-semibold text-[11px]">
                            {inst.paymentMode || 'Cash'}
                            {inst.transactionDetails && inst.transactionDetails !== 'Cash' && inst.transactionDetails !== 'Counter Payment' && (
                              <span className="block text-[9px] text-slate-500 font-normal">
                                {inst.transactionDetails}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-1.5 text-right font-black text-emerald-700">
                            {formatCurrency(inst.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-3 py-3 text-center text-slate-400 font-medium italic text-[11px]">
                          No payments cleared yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Collected & Outstanding Balance Due Box */}
            <div className="bg-gradient-to-r from-blue-50 via-white to-red-50 p-3 rounded-xl border border-slate-300 flex items-center justify-between mb-3.5 text-xs">
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-500">Total Fees Collected</span>
                <span className="text-base font-black text-emerald-700">{formatCurrency(student.totalPaid)}</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-bold uppercase text-slate-500">Outstanding Balance Due</span>
                <span
                  className={`text-base font-black ${
                    student.balanceLeft > 0 ? 'text-red-700' : 'text-emerald-600'
                  }`}
                >
                  {formatCurrency(student.balanceLeft)}
                </span>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-4 text-[9px] text-slate-500 space-y-0.5 border-t border-slate-200 pt-2 leading-tight">
              <p className="font-bold text-slate-700 uppercase tracking-wider">Terms & Conditions:</p>
              {(settings?.terms || [
                '1. The receipt is subject to realisation of payment.',
                '2. This receipt should be carefully preserved and must be produced on demand.',
                '3. Fees once paid are strictly non-refundable and non-transferable under any circumstances.',
              ]).map((term, i) => (
                <p key={i}>{term}</p>
              ))}
            </div>

            {/* Signature Block */}
            <div className="flex justify-end pt-3 border-t border-dashed border-slate-300 text-xs">
              <div className="text-center">
                <div className="text-[9px] font-bold text-blue-950 uppercase tracking-wider mb-6">
                  For {settings?.instituteName || 'SHREE SAI CLASSES'}
                </div>
                <div className="w-36 border-b border-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-600">Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
