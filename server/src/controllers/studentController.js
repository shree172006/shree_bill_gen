import { v4 as uuidv4 } from 'uuid';
import { Store, normalizeStandard, generateNextReceiptNo } from '../models/store.js';

// Section filtering helper
export const isMatchingSection = (rawStd = '', section = 'all') => {
  if (!section || section === 'all') return true;
  const standard = normalizeStandard(rawStd);
  const std = standard.toLowerCase();
  if (section === 'school') {
    return std.includes('class');
  }
  if (section === 'college') {
    return std.includes('fyjc') || std.includes('syjc') || std.includes('commerce');
  }
  return true;
};

export const getStudents = async (req, res) => {
  const students = await Store.fetchStudentsAsync();
  const { search, status, standard, section } = req.query;

  let filtered = [...students];

  // Role / Section-Based Filter
  if (section && section !== 'all') {
    filtered = filtered.filter((s) => isMatchingSection(s.standard, section));
  }

  // Standard dropdown filter
  if (standard && standard.toLowerCase() !== 'all') {
    filtered = filtered.filter(
      (s) => (s.standard || '').toLowerCase() === standard.toLowerCase()
    );
  }

  // Status Filter
  if (status && status.toLowerCase() !== 'all') {
    filtered = filtered.filter(
      (s) => (s.status || '').toUpperCase() === status.toUpperCase()
    );
  }

  // Search Query Filter
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        (s.studentName || '').toLowerCase().includes(q) ||
        (s.receiptNo || '').toLowerCase().includes(q) ||
        (s.fatherContact || '').includes(q) ||
        (s.motherContact || '').includes(q) ||
        (s.contactNo || '').includes(q) ||
        (s.parentContact || '').includes(q)
    );
  }

  res.json({ success: true, count: filtered.length, data: filtered });
};

export const getStudentById = (req, res) => {
  const students = Store.getStudents();
  const student = students.find((s) => s.id === req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  res.json({ success: true, data: student });
};

export const createStudent = async (req, res) => {
  const students = Store.getStudents();
  const now = new Date();
  const year = now.getFullYear();

  const id = `stud-${uuidv4()}`;
  const receiptNo = generateNextReceiptNo(students, year);

  const fatherContact = String(req.body.fatherContact || req.body.contactNo || '').trim();
  const motherContact = String(req.body.motherContact || req.body.parentContact || '').trim();

  // Attach installment receipt numbers e.g. SSC-REC-2026-001-01, SSC-REC-2026-001-02
  const installments = (req.body.installments || []).map((inst, idx) => {
    const sNo = inst.srNo || idx + 1;
    return {
      ...inst,
      srNo: sNo,
      receiptNo: `${receiptNo}-${String(sNo).padStart(2, '0')}`,
    };
  });

  const rawStudent = {
    id,
    receiptNo,
    studentName: req.body.studentName || 'Student Name',
    rollNo: req.body.rollNo || receiptNo,
    fatherContact,
    motherContact,
    contactNo: fatherContact,
    parentContact: motherContact,
    academicYear: req.body.academicYear || `${year}-${String(year + 1).slice(2)}`,
    standard: req.body.standard || 'Class 10',
    board: req.body.board || 'CBSE',
    courseName: req.body.courseName || `${req.body.standard || 'Class 10'} Package`,
    admissionDate: req.body.admissionDate || now.toISOString().split('T')[0],
    feesDate: req.body.feesDate || now.toISOString().split('T')[0],
    reportDate: req.body.reportDate || now.toISOString().split('T')[0],
    totalFees: parseFloat(req.body.totalFees || 0),
    discount: parseFloat(req.body.discount || 0),
    installments,
    notes: req.body.notes || '',
  };

  const student = Store.recalculate(rawStudent);
  await Store.upsertStudentAsync(student);

  res.status(201).json({ success: true, data: student });
};

export const updateStudent = async (req, res) => {
  const students = Store.getStudents();
  const index = students.findIndex((s) => s.id === req.params.id);

  if (index === 0 || index > 0) {
    const existing = students[index];
    const recNo = existing.receiptNo || generateNextReceiptNo(students);

    const fatherContact = String(req.body.fatherContact !== undefined ? req.body.fatherContact : (req.body.contactNo !== undefined ? req.body.contactNo : existing.fatherContact || '')).trim();
    const motherContact = String(req.body.motherContact !== undefined ? req.body.motherContact : (req.body.parentContact !== undefined ? req.body.parentContact : existing.motherContact || '')).trim();

    // Ensure all installments have their proper sequential installment receipt number
    const updatedInstallments = (req.body.installments || existing.installments || []).map((inst, idx) => {
      const sNo = inst.srNo || idx + 1;
      return {
        ...inst,
        srNo: sNo,
        receiptNo: inst.receiptNo || `${recNo}-${String(sNo).padStart(2, '0')}`,
      };
    });

    const updated = Store.recalculate({
      ...existing,
      ...req.body,
      fatherContact,
      motherContact,
      contactNo: fatherContact,
      parentContact: motherContact,
      installments: updatedInstallments,
      id: existing.id,
      receiptNo: recNo,
    });
    await Store.upsertStudentAsync(updated);
    return res.json({ success: true, data: updated });
  }

  res.status(404).json({ success: false, message: 'Student not found' });
};

export const deleteStudent = async (req, res) => {
  let students = Store.getStudents();
  const exists = students.some((s) => s.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  await Store.deleteStudentAsync(req.params.id);
  res.json({ success: true, message: 'Student deleted successfully' });
};

export const getStats = async (req, res) => {
  const { section } = req.query;
  let students = await Store.fetchStudentsAsync();

  if (section && section !== 'all') {
    students = students.filter((s) => isMatchingSection(s.standard, section));
  }

  const totalRevenue = students.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const totalCollected = students.reduce((acc, s) => acc + (s.totalPaid || 0), 0);
  const totalBalance = students.reduce((acc, s) => acc + (s.balanceLeft || 0), 0);

  const paidCount = students.filter((s) => s.status === 'PAID').length;
  const partialCount = students.filter((s) => s.status === 'PARTIAL').length;
  const pendingCount = students.filter((s) => s.status === 'PENDING').length;

  res.json({
    success: true,
    data: {
      totalStudents: students.length,
      totalRevenue,
      totalCollected,
      totalBalance,
      recoveryRate: totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0,
      statusCounts: {
        PAID: paidCount,
        PARTIAL: partialCount,
        PENDING: pendingCount,
      },
    },
  });
};
