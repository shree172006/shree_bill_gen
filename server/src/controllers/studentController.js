import { v4 as uuidv4 } from 'uuid';
import { Store, normalizeStandard } from '../models/store.js';

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

  if (search) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        s.studentName?.toLowerCase().includes(q) ||
        s.rollNo?.toLowerCase().includes(q) ||
        s.contactNo?.toLowerCase().includes(q) ||
        s.courseName?.toLowerCase().includes(q) ||
        s.receiptNo?.toLowerCase().includes(q)
    );
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((s) => s.status?.toUpperCase() === status.toUpperCase());
  }

  if (standard && standard !== 'all') {
    filtered = filtered.filter((s) => s.standard === standard);
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
  const receiptNo = `SSC-REC-${year}-${String(students.length + 1).padStart(3, '0')}`;

  const rawStudent = {
    id,
    receiptNo,
    studentName: req.body.studentName || 'Student Name',
    rollNo: req.body.rollNo || `SSC-${year}-${String(students.length + 1).padStart(3, '0')}`,
    contactNo: req.body.contactNo || '',
    parentContact: req.body.parentContact || '',
    academicYear: req.body.academicYear || `${year}-${String(year + 1).slice(2)}`,
    standard: req.body.standard || 'SYJC (12th Commerce)',
    board: req.body.board || 'CBSE',
    courseName: req.body.courseName || `${req.body.standard || 'SYJC'} Course Package`,
    admissionDate: req.body.admissionDate || now.toISOString().split('T')[0],
    feesDate: req.body.feesDate || now.toISOString().split('T')[0],
    reportDate: req.body.reportDate || now.toISOString().split('T')[0],
    totalFees: parseFloat(req.body.totalFees || 0),
    discount: parseFloat(req.body.discount || 0),
    installments: req.body.installments || [],
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
    const updated = Store.recalculate({
      ...students[index],
      ...req.body,
      id: students[index].id,
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
