import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  GraduationCap,
  Loader2,
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

  const pendingInstallments = (student.installments || []).filter(
    (i) => i.status !== 'PAID'
  );
  const nextPending = pendingInstallments[0];
  const nextDueDateRaw = nextPending?.dueDate || student.dueDate || student.nextDueDate;
  const nextDueDateVal = nextDueDateRaw ? formatDate(nextDueDateRaw) : null;
  const formattedNextDue = (nextDueDateVal && nextDueDateVal !== '-') ? nextDueDateVal : null;

  const latestPaid = paidInstallments.length > 0 ? paidInstallments[paidInstallments.length - 1] : null;
  const activeReceiptNo = latestPaid?.receiptNo || (student.receiptNo ? `${student.receiptNo}-01` : 'SSC-REC-001-01');

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
      ? inst.map((i, idx) => {
          const sNo = i.srNo || idx + 1;
          const instRecNo = i.receiptNo || `${student.receiptNo}-${String(sNo).padStart(2, '0')}`;
          return `
          <tr style="background:${idx % 2 === 0 ? '#f0fdf4' : '#ffffff'}">
            <td style="padding:7px 10px;font-weight:700;color:#1e293b;font-size:11px;border-bottom:1px solid #e2e8f0">Installment</td>
            <td style="padding:7px 10px;font-family:monospace;font-weight:700;color:#172554;font-size:10px;border-bottom:1px solid #e2e8f0">${instRecNo}</td>
            <td style="padding:7px 10px;color:#475569;font-size:11px;border-bottom:1px solid #e2e8f0">${formatDate(i.paidDate || i.dueDate)}</td>
            <td style="padding:7px 10px;color:#1e293b;font-weight:600;font-size:11px;border-bottom:1px solid #e2e8f0">${i.paymentMode || 'Cash'}</td>
            <td style="padding:7px 10px;text-align:right;font-weight:900;color:#15803d;font-size:11px;border-bottom:1px solid #e2e8f0">${formatCurrency(i.amount)}</td>
          </tr>`;
        }).join('')
      : `<tr><td colspan="5" style="padding:14px;text-align:center;color:#94a3b8;font-style:italic;font-size:11px">No payments cleared yet.</td></tr>`;

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
  body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#0f172a;font-size:12px;line-height:1.45}
</style>
</head>
<body style="padding:28px 32px;width:800px;background:#ffffff">
  <!-- Institute Header Banner -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1e3a8a;padding-bottom:14px;margin-bottom:16px">
    <div style="display:flex;align-items:flex-start;gap:14px">
      <div style="width:62px;height:62px;background:#ffffff;border-radius:12px;border:2px solid #dc2626;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;padding:2px">
        <img src="${window.location.origin}/logo.png" alt="Shree Sai Classes" style="width:100%;height:100%;object-fit:contain" />
      </div>
      <div>
        <h1 style="font-size:22px;font-weight:900;color:#1e3a8a;letter-spacing:-0.5px;line-height:1.15">${instituteName}</h1>
        <p style="font-size:11px;font-weight:700;color:#dc2626;margin-top:3px">${tagline}</p>
        <p style="font-size:10px;color:#64748b;margin-top:2px">${address}</p>
        <p style="font-size:10px;font-weight:600;color:#334155;margin-top:2px">Student's Care No.: ${phone}</p>
      </div>
    </div>
    <div style="text-align:right;flex-shrink:0">
      <div style="background:#dc2626;color:#ffffff;font-weight:900;font-size:11px;letter-spacing:1px;padding:4px 12px;border-radius:4px;display:inline-block;text-transform:uppercase">FEE RECEIPT</div>
      <p style="font-size:13px;font-weight:800;font-family:monospace;color:#1e3a8a;margin-top:4px">${activeReceiptNo}</p>
      <p style="font-size:10px;font-weight:600;color:#64748b;margin-top:2px">Date: ${todayStr}</p>
    </div>
  </div>

  <!-- Student Particulars (Clean 4-Column Structured Table) -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden">
    <tr>
      <td style="padding:8px 12px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;width:18%;border-bottom:1px solid #e2e8f0">Student Full Name</td>
      <td style="padding:8px 12px;font-size:13px;font-weight:900;color:#1e3a8a;width:32%;border-bottom:1px solid #e2e8f0">${student.studentName}</td>
      <td style="padding:8px 12px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;width:18%;border-bottom:1px solid #e2e8f0">Standard / Class</td>
      <td style="padding:8px 12px;font-size:12px;font-weight:800;color:#dc2626;width:32%;border-bottom:1px solid #e2e8f0">${student.standard}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2e8f0">Reg. / Roll No.</td>
      <td style="padding:8px 12px;font-size:11px;font-weight:700;font-family:monospace;color:#1e293b;border-bottom:1px solid #e2e8f0">${student.receiptNo || '—'}</td>
      <td style="padding:8px 12px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2e8f0">Academic Year</td>
      <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#1e293b;border-bottom:1px solid #e2e8f0">${student.academicYear || '2026-27'}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2e8f0">Father Contact No</td>
      <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#1e293b;border-bottom:1px solid #e2e8f0">${student.fatherContact || student.contactNo || '—'}</td>
      <td style="padding:8px 12px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2e8f0">Mother Contact No</td>
      <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#1e293b;border-bottom:1px solid #e2e8f0">${student.motherContact || student.parentContact || '—'}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase">Date of Admission</td>
      <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#1e293b">${admDate}</td>
      <td style="padding:8px 12px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase">Receipt Issue Date</td>
      <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#1e293b">${todayStr}</td>
    </tr>
  </table>

  <!-- Fee Particulars & Cleared Payment Receipts Ledger -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden">
    <thead>
      <tr style="background:#1e3a8a;color:#ffffff">
        <th style="padding:9px 12px;text-align:left;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px">Fee Particular / Cleared Installment</th>
        <th style="padding:9px 12px;text-align:left;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px">Receipt No.</th>
        <th style="padding:9px 12px;text-align:left;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px">Date</th>
        <th style="padding:9px 12px;text-align:left;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px">Mode</th>
        <th style="padding:9px 12px;text-align:right;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      <!-- Base Course Fee Structure -->
      <tr style="background:#f8fafc">
        <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#334155;border-bottom:1px solid #e2e8f0">Total Course Tuition Fees</td>
        <td style="padding:8px 12px;font-size:11px;color:#94a3b8;border-bottom:1px solid #e2e8f0">—</td>
        <td style="padding:8px 12px;font-size:11px;color:#94a3b8;border-bottom:1px solid #e2e8f0">—</td>
        <td style="padding:8px 12px;font-size:11px;color:#94a3b8;border-bottom:1px solid #e2e8f0">—</td>
        <td style="padding:8px 12px;font-size:11px;font-weight:800;color:#0f172a;text-align:right;border-bottom:1px solid #e2e8f0">${formatCurrency(student.totalFees)}</td>
      </tr>
      ${student.discount > 0 ? `
      <tr style="background:#f0fdf4">
        <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#059669;border-bottom:1px solid #e2e8f0">Less: Special Scholarship / Fee Concession</td>
        <td style="padding:8px 12px;font-size:11px;color:#94a3b8;border-bottom:1px solid #e2e8f0">—</td>
        <td style="padding:8px 12px;font-size:11px;color:#94a3b8;border-bottom:1px solid #e2e8f0">—</td>
        <td style="padding:8px 12px;font-size:11px;color:#94a3b8;border-bottom:1px solid #e2e8f0">—</td>
        <td style="padding:8px 12px;font-size:11px;font-weight:800;color:#059669;text-align:right;border-bottom:1px solid #e2e8f0">- ${formatCurrency(student.discount)}</td>
      </tr>` : ''}
      <!-- Cleared Installment Rows Header -->
      <tr style="background:#e2e8f0">
        <td colspan="5" style="padding:6px 12px;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#334155;border-bottom:1px solid #cbd5e1">Installments Paid &amp; Cleared (${inst.length} Cleared)</td>
      </tr>
      ${rowsHTML}
    </tbody>
  </table>

  <!-- Financial Balance Strip (3 Columns) -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:8px;padding:12px 18px;margin-bottom:16px">
    <div style="text-align:center">
      <div style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:2px">Net Payable Fees</div>
      <div style="font-size:16px;font-weight:900;color:#1e293b">${formatCurrency(student.grandTotal)}</div>
    </div>
    <div style="text-align:center;border-left:1px solid #cbd5e1;border-right:1px solid #cbd5e1">
      <div style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#059669;margin-bottom:2px">Total Fees Collected</div>
      <div style="font-size:18px;font-weight:900;color:#15803d">${formatCurrency(student.totalPaid)}</div>
    </div>
    <div style="text-align:center">
      <div style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${student.balanceLeft > 0 ? '#b91c1c' : '#059669'};margin-bottom:2px">Outstanding Balance Due</div>
      <div style="font-size:18px;font-weight:900;color:${student.balanceLeft > 0 ? '#b91c1c' : '#15803d'}">${student.balanceLeft > 0 ? formatCurrency(student.balanceLeft) : 'NIL (FULLY CLEARED)'}</div>
      ${student.balanceLeft > 0 && formattedNextDue ? `
        <div style="font-size:9.5px;font-weight:800;color:#dc2626;margin-top:3px;letter-spacing:0.2px">Next Due: ${formattedNextDue}</div>
      ` : ''}
    </div>
  </div>

  <!-- Terms & Signatures -->
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:16px;padding-top:12px;border-top:1px dashed #cbd5e1">
    <div style="max-width:440px">
      <p style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#475569;margin-bottom:3px">Terms &amp; Conditions:</p>
      ${terms.map(t => `<p style="font-size:8.5px;color:#64748b;line-height:1.4">${t}</p>`).join('')}
      <p style="font-size:8.5px;color:#94a3b8;font-style:italic;margin-top:4px">This is a verified official fee receipt issued by Shree Sai Classes.</p>
    </div>
    <div style="text-align:center;min-width:180px">
      <div style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#1e3a8a;margin-bottom:36px">For ${instituteName}</div>
      <div style="width:160px;border-bottom:1.5px solid #64748b;margin:0 auto 4px"></div>
      <div style="font-size:10px;font-weight:800;color:#334155">Authorized Signatory</div>
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
      fileName: `Fee_Receipt_${activeReceiptNo || student.studentName}.pdf`,
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
      console.error('Download error:', err);
      alert('Could not download PDF. Please use the Print button instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Modern Universal Share PDF handler
  const handleSharePDF = async () => {
    try {
      setIsGenerating(true);
      const result = await generatePDFBlob();
      if (!result) return;

      const pdfFile = new File([result.blob], result.fileName, {
        type: 'application/pdf',
      });

      // 1. If Web Share API supports file sharing, open device share sheet
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: `Fee Receipt - ${student.studentName}`,
          text: `Fee Receipt for ${student.studentName} (${activeReceiptNo}) from ${settings?.instituteName || 'Shree Sai Classes'}.`,
        });
        return;
      }

      // 2. Fallback: Automatically download file and notify user
      result.pdfInstance.save(result.fileName);
      alert('PDF receipt downloaded! You can now attach and share it via WhatsApp, Telegram, Email, or Drive.');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        alert('Could not open share menu. Downloading the PDF instead.');
        handleDownloadPDF();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full h-[94vh] sm:h-auto sm:max-h-[96vh] flex flex-col shadow-2xl border-0 sm:border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in duration-200 my-0 sm:my-auto print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Mobile Pull Indicator (Phones only) */}
        <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Modal Controls Header (Hidden on Print) */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 bg-slate-100 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">Fee Receipt</span>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-blue-900 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded border border-blue-200 shrink-0">
              {activeReceiptNo}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Share PDF anywhere (WhatsApp, Telegram, Email, Drive, AirDrop, etc.) */}
            <button
              onClick={handleSharePDF}
              disabled={isGenerating}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
              title="Share PDF Receipt (WhatsApp, Telegram, Email, Drive, etc.)"
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
              <span className="inline">Share</span>
            </button>

            {/* Save PDF (Desktop & Tablet) */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
              title="Download PDF Receipt"
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>Save PDF</span>
            </button>

            {/* Print (Desktop & Tablet) */}
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-2xs active:scale-95"
              title="Print Receipt"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors ml-0.5 active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container (Smooth scroll on phone) */}
        <div className="p-2 sm:p-5 overflow-y-auto bg-slate-100 flex-1 print:p-0 print:bg-white print:overflow-visible">
          <div
            id="printable-receipt"
            ref={receiptRef}
            className="bg-white max-w-xl mx-auto p-3.5 sm:p-6 rounded-2xl border border-slate-300 shadow-sm font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 relative text-xs print:border-none print:shadow-none print:max-w-none print:p-0"
          >
            {/* Academy Crest & Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-blue-950 pb-3 mb-3 gap-2.5 sm:gap-3">
              <div className="flex items-center sm:items-start gap-2.5 sm:gap-3">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-white p-1 flex items-center justify-center border-2 border-red-600 shadow-sm shrink-0 overflow-hidden">
                  <img src="/logo.png" alt="Shree Sai Classes" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-black text-blue-950 font-heading tracking-tight leading-tight">
                    {settings?.instituteName || 'SHREE SAI CLASSES'}
                  </h1>
                  <p className="text-[10px] sm:text-[11px] font-bold text-red-600 mt-0.5">
                    {settings?.tagline || 'A Choice of Better Life...! | Hard Work + Quality = Success'}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 leading-tight">
                    {settings?.address || 'Shiv Dham Society No. 5, Opp. BMC Colony, M. D. Nagar, Nallasopara (E)'}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-600 font-semibold mt-0.5">
                    Student's Care: {settings?.phone || '+91 7378756695 / +91 7378756653'}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0">
                <span className="inline-block px-2 sm:px-2.5 py-0.5 bg-red-600 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider rounded">
                  FEE RECEIPT
                </span>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-blue-950 sm:mt-1">
                    {activeReceiptNo}
                  </p>
                  <p className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium">
                    Date: {formatDate(new Date())}
                  </p>
                </div>
              </div>
            </div>

            {/* Student Particulars (Responsive 2-Col on Mobile, 4-Col on Desktop) */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 mb-3 overflow-hidden p-2.5 sm:p-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
                <div className="col-span-2 sm:col-span-1">
                  <span className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Student Name</span>
                  <span className="font-black text-blue-950 text-xs sm:text-sm truncate block">{student.studentName}</span>
                </div>

                <div>
                  <span className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Standard / Class</span>
                  <span className="font-bold text-red-600 text-xs sm:text-[13px] block">{student.standard}</span>
                </div>

                <div>
                  <span className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reg. / Roll No.</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px] sm:text-xs block">{student.receiptNo || '—'}</span>
                </div>

                <div>
                  <span className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Academic Year</span>
                  <span className="font-bold text-slate-800 text-[11px] sm:text-xs block">{student.academicYear || '2026-27'}</span>
                </div>

                <div>
                  <span className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Father Contact</span>
                  <span className="font-bold text-slate-800 text-[11px] sm:text-xs block">{student.fatherContact || student.contactNo || '—'}</span>
                </div>

                <div>
                  <span className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mother Contact</span>
                  <span className="font-bold text-slate-800 text-[11px] sm:text-xs block">{student.motherContact || student.parentContact || '—'}</span>
                </div>

                <div>
                  <span className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admission Date</span>
                  <span className="font-bold text-slate-800 text-[11px] sm:text-xs block">{formatDate(student.admissionDate)}</span>
                </div>

                <div>
                  <span className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Receipt Issue</span>
                  <span className="font-bold text-slate-800 text-[11px] sm:text-xs block">{formatDate(new Date())}</span>
                </div>
              </div>
            </div>

            {/* Unified Fee Structure & Payments Breakdown Table (Scroll-safe on phone) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-3 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[440px] sm:min-w-full">
                  <thead>
                    <tr className="bg-blue-950 text-white text-[9px] font-bold uppercase tracking-wider">
                      <th className="px-2.5 sm:px-3 py-2">Particulars / Payment Details</th>
                      <th className="px-2 sm:px-3 py-2">Receipt No.</th>
                      <th className="px-2 sm:px-3 py-2">Date</th>
                      <th className="px-2 sm:px-3 py-2">Mode</th>
                      <th className="px-2.5 sm:px-3 py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50/70">
                      <td className="px-2.5 sm:px-3 py-1.5 font-bold text-slate-700">Total Course Tuition Fees</td>
                      <td className="px-2 sm:px-3 py-1.5 text-slate-400">—</td>
                      <td className="px-2 sm:px-3 py-1.5 text-slate-400">—</td>
                      <td className="px-2 sm:px-3 py-1.5 text-slate-400">—</td>
                      <td className="px-2.5 sm:px-3 py-1.5 text-right font-black text-slate-900">{formatCurrency(student.totalFees)}</td>
                    </tr>
                    {student.discount > 0 && (
                      <tr className="bg-emerald-50/50">
                        <td className="px-2.5 sm:px-3 py-1.5 font-bold text-emerald-800">Less: Scholarship Concession</td>
                        <td className="px-2 sm:px-3 py-1.5 text-slate-400">—</td>
                        <td className="px-2 sm:px-3 py-1.5 text-slate-400">—</td>
                        <td className="px-2 sm:px-3 py-1.5 text-slate-400">—</td>
                        <td className="px-2.5 sm:px-3 py-1.5 text-right font-bold text-emerald-700">- {formatCurrency(student.discount)}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-200/80">
                      <td colSpan={5} className="px-2.5 sm:px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-700">
                        Cleared Installment Payments ({paidInstallments.length} Cleared)
                      </td>
                    </tr>
                    {paidInstallments.length > 0 ? (
                      paidInstallments.map((inst, idx) => {
                        const sNo = inst.srNo || idx + 1;
                        const instRecNo = inst.receiptNo || `${student.receiptNo}-${String(sNo).padStart(2, '0')}`;
                        return (
                          <tr key={idx} className="bg-emerald-50/30">
                            <td className="px-2.5 sm:px-3 py-1.5 font-bold text-slate-800">
                              Installment
                            </td>
                            <td className="px-2 sm:px-3 py-1.5 font-mono font-bold text-blue-950 text-[10px] whitespace-nowrap">
                              {instRecNo}
                            </td>
                            <td className="px-2 sm:px-3 py-1.5 text-slate-700 font-medium text-[10px] sm:text-[11px] whitespace-nowrap">
                              {formatDate(inst.paidDate || inst.dueDate)}
                            </td>
                            <td className="px-2 sm:px-3 py-1.5 text-slate-800 font-semibold text-[10px] sm:text-[11px]">
                              {inst.paymentMode || 'Cash'}
                              {inst.transactionDetails && inst.transactionDetails !== 'Cash' && inst.transactionDetails !== 'Counter Payment' && (
                                <span className="block text-[8.5px] text-slate-500 font-normal">
                                  {inst.transactionDetails}
                                </span>
                              )}
                            </td>
                            <td className="px-2.5 sm:px-3 py-1.5 text-right font-black text-emerald-700 whitespace-nowrap">
                              {formatCurrency(inst.amount)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-3 text-center text-slate-400 font-medium italic text-[11px]">
                          No payments cleared yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Balance Strip (3 Columns, mobile optimized) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-300 text-center mb-3 text-xs">
              <div className="flex flex-col justify-center">
                <span className="block text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider text-slate-500 leading-tight">Net Total</span>
                <span className="text-xs sm:text-base font-black text-slate-900 mt-0.5">{formatCurrency(student.grandTotal)}</span>
              </div>
              <div className="border-x border-slate-200 px-1 flex flex-col justify-center">
                <span className="block text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider text-emerald-600 leading-tight">Collected</span>
                <span className="text-xs sm:text-base font-black text-emerald-700 mt-0.5">{formatCurrency(student.totalPaid)}</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="block text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider text-red-500 leading-tight">Balance Due</span>
                <span
                  className={`text-xs sm:text-base font-black mt-0.5 ${
                    student.balanceLeft > 0 ? 'text-red-700' : 'text-emerald-600'
                  }`}
                >
                  {student.balanceLeft > 0 ? formatCurrency(student.balanceLeft) : 'NIL'}
                </span>
                {student.balanceLeft > 0 && formattedNextDue && (
                  <span className="block text-[8.5px] sm:text-[9.5px] font-bold text-red-600 mt-0.5 whitespace-nowrap">
                    Next Due: {formattedNextDue}
                  </span>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-3 sm:mb-4 text-[8.5px] sm:text-[9px] text-slate-500 space-y-0.5 border-t border-slate-200 pt-2 leading-tight">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px]">Terms & Conditions:</p>
              {(settings?.terms || [
                '1. The receipt is subject to realisation of payment.',
                '2. This receipt should be carefully preserved and must be produced on demand.',
                '3. Fees once paid are strictly non-refundable and non-transferable under any circumstances.',
              ]).map((term, i) => (
                <p key={i}>{term}</p>
              ))}
            </div>

            {/* Signature Block */}
            <div className="flex justify-end pt-2 sm:pt-3 border-t border-dashed border-slate-300 text-xs">
              <div className="text-center">
                <div className="text-[9px] font-bold text-blue-950 uppercase tracking-wider mb-5 sm:mb-6">
                  For {settings?.instituteName || 'SHREE SAI CLASSES'}
                </div>
                <div className="w-32 sm:w-36 border-b border-slate-400 mb-1" />
                <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-600">Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Mobile Bottom Action Bar (Thumb-friendly on Phones) */}
        <div className="p-3 sm:hidden border-t border-slate-200 bg-white flex items-center gap-2 shrink-0 shadow-lg no-print">
          <button
            onClick={handleSharePDF}
            disabled={isGenerating}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 disabled:opacity-50 transition-all"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            <span>Share PDF</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 disabled:opacity-50 transition-all"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
