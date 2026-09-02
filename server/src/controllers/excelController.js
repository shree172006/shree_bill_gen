import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { Store } from '../models/store.js';
import { isMatchingSection } from './studentController.js';

// Format Date helper with Excel serial number support
const formatDateVal = (dateStr) => {
  if (!dateStr) return '';
  try {
    const num = Number(dateStr);
    if (!isNaN(num) && num > 30000 && num < 65000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const jsDate = new Date(excelEpoch.getTime() + num * 86400000);
      const day = String(jsDate.getUTCDate()).padStart(2, '0');
      const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
      const year = jsDate.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }

    if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
      return dateStr;
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    if (d.getFullYear() > 2099) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (_) {
    return String(dateStr);
  }
};

/**
 * Generates and downloads the Official Shree Sai Classes Ledger Excel Template
 * matching the exact multi-installment structure.
 */
export const downloadTemplate = (req, res) => {
  const wb = XLSX.utils.book_new();

  const sampleData = [
    {
      'Sr.No.': 1,
      'Reg No.': 'SSC-REC-2026-001',
      '*': 'PARTIAL',
      'Name of Student': 'Rohan Sharma',
      Std: 'SYJC (12th Commerce)',
      'Date Of Admission': '01/06/2026',
      'Yearly Fees': 45000,
      'Actual Fees': 40000,
      'RECEIVED FROM PARENTS 1': 10000,
      'RECEIVED DATE 1': '01/06/2026',
      'RECEIPT NO. 1': 'SSC-REC-2026-001-01',
      'RECEIVED FROM PARENTS 2': 10000,
      'RECEIVED DATE 2': '01/08/2026',
      'RECEIPT NO. 2': 'SSC-REC-2026-001-02',
      'RECEIVED FROM PARENTS 3': 0,
      'RECEIVED DATE 3': '',
      'RECEIPT NO. 3': '',
      'RECEIVED FROM PARENTS 4': 0,
      'RECEIVED DATE 4': '',
      'RECEIPT NO. 4': '',
      'RECEIVED FROM PARENTS 5': 0,
      'RECEIVED DATE 5': '',
      'RECEIPT NO. 5': '',
      PENDING: 20000,
      REMARK: 'Installment 3 due next month',
      'DUE DATE': '01/10/2026',
      'Mode Of Payment 1': 'Cash',
      'Mode Of Payment 2': 'UPI',
      'Mode Of Payment 3': '',
      'Mode Of Payment 4': '',
    },
    {
      'Sr.No.': 2,
      'Reg No.': 'SSC-REC-2026-002',
      '*': 'PAID',
      'Name of Student': 'Priya Deshmukh',
      Std: 'Class 10',
      'Date Of Admission': '15/06/2026',
      'Yearly Fees': 35000,
      'Actual Fees': 35000,
      'RECEIVED FROM PARENTS 1': 15000,
      'RECEIVED DATE 1': '15/06/2026',
      'RECEIPT NO. 1': 'SSC-REC-2026-002-01',
      'RECEIVED FROM PARENTS 2': 20000,
      'RECEIVED DATE 2': '15/08/2026',
      'RECEIPT NO. 2': 'SSC-REC-2026-002-02',
      'RECEIVED FROM PARENTS 3': 0,
      'RECEIVED DATE 3': '',
      'RECEIPT NO. 3': '',
      'RECEIVED FROM PARENTS 4': 0,
      'RECEIVED DATE 4': '',
      'RECEIPT NO. 4': '',
      'RECEIVED FROM PARENTS 5': 0,
      'RECEIVED DATE 5': '',
      'RECEIPT NO. 5': '',
      PENDING: 0,
      REMARK: '100% Fees Cleared',
      'DUE DATE': '',
      'Mode Of Payment 1': 'UPI',
      'Mode Of Payment 2': 'Cash',
      'Mode Of Payment 3': '',
      'Mode Of Payment 4': '',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);

  // Auto column widths
  const colWidths = Object.keys(sampleData[0]).map((key) => ({
    wch: Math.max(key.length + 3, 14),
  }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Fee_Ledger');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader(
    'Content-Disposition',
    'attachment; filename="Shree_Sai_Classes_Fee_Ledger_Template.xlsx"'
  );
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.send(buffer);
};

/**
 * Imports Excel data matching the official ledger schema and syncs to store
 */
export const uploadExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No Excel or CSV file uploaded.' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Uploaded sheet contains no data rows.' });
    }

    const students = Store.getStudents();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const createdList = [];

    const getField = (row, candidates) => {
      for (const cand of candidates) {
        const foundKey = Object.keys(row).find((k) => k.trim().toLowerCase() === cand.toLowerCase());
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') {
          return row[foundKey];
        }
      }
      return '';
    };

    rawRows.forEach((row, idx) => {
      const studentName = getField(row, ['Name of Student', 'Student Name', 'student', 'name']);
      if (!studentName) return;

      const regNo =
        getField(row, ['Reg No.', 'Reg No', 'Receipt No', 'Receipt No.']) ||
        `SSC-REC-${now.getFullYear()}-${String(students.length + idx + 1).padStart(3, '0')}`;

      const standard = getField(row, ['Std', 'Standard', 'Class', 'Standard / Class']) || 'SYJC (12th Commerce)';
      const admissionDate = getField(row, ['Date Of Admission', 'Admission Date']) || todayStr;
      const yearlyFees = parseFloat(getField(row, ['Yearly Fees', 'Total Fees', 'Fees']) || 0);
      const actualFees = parseFloat(getField(row, ['Actual Fees', 'Grand Total', 'Net Fees']) || yearlyFees);
      const discount = Math.max(0, yearlyFees - actualFees);
      const remark = getField(row, ['REMARK', 'Remark', 'Notes', 'Note']);
      const dueDateVal = getField(row, ['DUE DATE', 'Due Date']);

      // Extract up to 5 installments from parent payments columns
      const installments = [];
      for (let i = 1; i <= 5; i++) {
        const receivedAmt = parseFloat(
          getField(row, [`RECEIVED FROM PARENTS ${i}`, `RECEIVED ${i}`, `PARENTS ${i}`]) || 0
        );
        const receivedDate = getField(row, [`RECEIVED DATE ${i}`, `RECEIVED DATE`, `DATE ${i}`]) || todayStr;
        const receiptNoInst = getField(row, [`RECEIPT NO. ${i}`, `RECEIPT NO`, `RECEIPT ${i}`]) || `${regNo}-0${i}`;
        const mode = getField(row, [`Mode Of Payment ${i}`, `Mode Of Payment`, `Mode ${i}`]) || 'Cash';

        if (receivedAmt > 0) {
          installments.push({
            srNo: i,
            dueDate: receivedDate || todayStr,
            paidDate: receivedDate || todayStr,
            status: 'PAID',
            amount: receivedAmt,
            paymentMode: mode,
            transactionDetails: receiptNoInst ? `Receipt #${receiptNoInst}` : 'Paid',
          });
        }
      }

      // If pending balance remains, add pending installment row
      const totalPaid = installments.reduce((acc, inst) => acc + inst.amount, 0);
      const pendingBalance = Math.max(0, actualFees - totalPaid);

      if (pendingBalance > 0) {
        installments.push({
          srNo: installments.length + 1,
          dueDate: dueDateVal || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          paidDate: '',
          status: 'PENDING',
          amount: pendingBalance,
          paymentMode: '',
          transactionDetails: '',
        });
      }

      const newStudent = Store.recalculate({
        id: `stud-${uuidv4()}`,
        receiptNo: regNo,
        studentName,
        rollNo: regNo,
        contactNo: '',
        parentContact: '',
        academicYear: `${now.getFullYear()}-${String(now.getFullYear() + 1).slice(-2)}`,
        standard,
        courseName: `${standard} Package`,
        admissionDate: typeof admissionDate === 'string' && admissionDate.includes('/')
          ? admissionDate.split('/').reverse().join('-')
          : admissionDate || todayStr,
        feesDate: todayStr,
        reportDate: todayStr,
        totalFees: yearlyFees > 0 ? yearlyFees : actualFees,
        discount,
        installments: installments.length > 0 ? installments : [
          {
            srNo: 1,
            dueDate: todayStr,
            paidDate: todayStr,
            status: 'PAID',
            amount: actualFees,
            paymentMode: 'Cash',
            transactionDetails: 'Full payment',
          },
        ],
        notes: remark || 'Imported via Excel ledger',
      });

      createdList.push(newStudent);
    });

    if (createdList.length === 0) {
      return res.status(400).json({ success: false, message: 'Could not extract valid student rows from file.' });
    }

    await Store.upsertBatchAsync(createdList);

    res.json({
      success: true,
      message: `Successfully imported ${createdList.length} students into ledger.`,
      count: createdList.length,
      data: createdList,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Excel parsing failed: ${err.message}` });
  }
};

/**
 * Exports the complete ledger matching the exact required column format:
 * Sr.No. | Reg No. | * | Name of Student | Std | Date Of Admission | Yearly Fees | Actual Fees |
 * RECEIVED FROM PARENTS 1..5 | RECEIVED DATE | RECEIPT NO. | PENDING | REMARK | DUE DATE | Mode Of Payment 1..4
 */
export const exportStudents = (req, res) => {
  const students = Store.getStudents();
  const { status, standard, section } = req.query;

  let list = [...students];
  if (section && section !== 'all') {
    list = list.filter((s) => isMatchingSection(s.standard, section));
  }
  if (status && status !== 'all') {
    list = list.filter((s) => s.status?.toUpperCase() === status.toUpperCase());
  }
  if (standard && standard !== 'all') {
    list = list.filter((s) => s.standard === standard);
  }

  const exportRows = list.map((s, idx) => {
    const installments = s.installments || [];
    const paidList = installments.filter((i) => i.status === 'PAID');
    const pendingList = installments.filter((i) => i.status !== 'PAID');

    const inst1 = paidList[0];
    const inst2 = paidList[1];
    const inst3 = paidList[2];
    const inst4 = paidList[3];
    const inst5 = paidList[4];

    const nextDue = pendingList[0]?.dueDate || '';

    return {
      'Sr.No.': idx + 1,
      'Reg No.': s.receiptNo || `SSC-REC-${idx + 1}`,
      '*': s.status || (s.balanceLeft === 0 ? 'PAID' : s.totalPaid > 0 ? 'PARTIAL' : 'PENDING'),
      'Name of Student': s.studentName,
      Std: s.standard,
      'Date Of Admission': formatDateVal(s.admissionDate),
      'Yearly Fees': s.totalFees || s.grandTotal,
      'Actual Fees': s.grandTotal,
      'RECEIVED FROM PARENTS 1': inst1 ? inst1.amount : 0,
      'RECEIVED DATE 1': inst1 ? formatDateVal(inst1.paidDate || inst1.dueDate) : '',
      'RECEIPT NO. 1': inst1 ? `${s.receiptNo || 'SSC'}-01` : '',
      'RECEIVED FROM PARENTS 2': inst2 ? inst2.amount : 0,
      'RECEIVED DATE 2': inst2 ? formatDateVal(inst2.paidDate || inst2.dueDate) : '',
      'RECEIPT NO. 2': inst2 ? `${s.receiptNo || 'SSC'}-02` : '',
      'RECEIVED FROM PARENTS 3': inst3 ? inst3.amount : 0,
      'RECEIVED DATE 3': inst3 ? formatDateVal(inst3.paidDate || inst3.dueDate) : '',
      'RECEIPT NO. 3': inst3 ? `${s.receiptNo || 'SSC'}-03` : '',
      'RECEIVED FROM PARENTS 4': inst4 ? inst4.amount : 0,
      'RECEIVED DATE 4': inst4 ? formatDateVal(inst4.paidDate || inst4.dueDate) : '',
      'RECEIPT NO. 4': inst4 ? `${s.receiptNo || 'SSC'}-04` : '',
      'RECEIVED FROM PARENTS 5': inst5 ? inst5.amount : 0,
      'RECEIVED DATE 5': inst5 ? formatDateVal(inst5.paidDate || inst5.dueDate) : '',
      'RECEIPT NO. 5': inst5 ? `${s.receiptNo || 'SSC'}-05` : '',
      PENDING: s.balanceLeft,
      REMARK: s.notes || '',
      'DUE DATE': formatDateVal(nextDue),
      'Mode Of Payment 1': inst1 ? (inst1.paymentMode || 'Cash') : '',
      'Mode Of Payment 2': inst2 ? (inst2.paymentMode || 'Cash') : '',
      'Mode Of Payment 3': inst3 ? (inst3.paymentMode || 'Cash') : '',
      'Mode Of Payment 4': inst4 ? (inst4.paymentMode || 'Cash') : '',
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportRows);

  // Auto-fit column widths
  if (exportRows.length > 0) {
    const colWidths = Object.keys(exportRows[0]).map((key) => ({
      wch: Math.max(key.length + 3, 14),
    }));
    ws['!cols'] = colWidths;
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Shree_Sai_Fee_Ledger');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Shree_Sai_Classes_Fee_Ledger_${new Date().toISOString().split('T')[0]}.xlsx"`
  );
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.send(buffer);
};
