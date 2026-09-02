import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default Official Settings
const DEFAULT_SETTINGS = {
  instituteName: 'SHREE SAI CLASSES',
  tagline: 'A Choice of Better Life...! | Hard Work + Quality = Success',
  address: 'Shiv Dham Society No. 5, Opp. BMC Colony, M. D. Nagar, Nallasopara (E)',
  phone: '+91 7378756695 / +91 7378756653',
  email: '',
  website: 'www.shreesaiclasses.edu.in',
  receiptPrefix: 'SSC-REC',
  terms: [
    '1. The receipt is subject to realisation of payment.',
    '2. This receipt should be carefully preserved and must be produced on demand.',
    '3. Fees once paid are strictly non-refundable and non-transferable under any circumstances.',
    '4. Shree Sai Classes reserves all rights for admission & schedule changes.',
  ],
};

export const normalizeExcelDate = (val) => {
  if (!val || val === '-') return '';
  const num = Number(val);
  if (!isNaN(num) && num > 30000 && num < 65000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const jsDate = new Date(excelEpoch.getTime() + num * 86400000);
    const y = jsDate.getUTCFullYear();
    const m = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(jsDate.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^\d{5}$/.test(trimmed)) {
      const n = parseInt(trimmed, 10);
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const jsDate = new Date(excelEpoch.getTime() + n * 86400000);
      const y = jsDate.getUTCFullYear();
      const m = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
      const d = String(jsDate.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      const [d, m, y] = trimmed.split('/');
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.split('T')[0];
    }
  }
  return String(val);
};

export const normalizeStandard = (rawStd = '') => {
  if (!rawStd) return 'Class 10';
  const s = String(rawStd).trim();
  const lower = s.toLowerCase();

  if (lower === 'x' || lower === '10' || lower === '10th' || lower === 'class 10' || lower.includes('10th') || lower.includes('class 10')) {
    return 'Class 10';
  }
  if (lower === 'ix' || lower === '9' || lower === '9th' || lower === 'class 9' || lower.includes('9th') || lower.includes('class 9')) {
    return 'Class 9';
  }
  if (lower === 'viii' || lower === '8' || lower === '8th' || lower === 'class 8' || lower.includes('8th') || lower.includes('class 8')) {
    return 'Class 8';
  }
  if (lower === 'vii' || lower === '7' || lower === '7th' || lower === 'class 7' || lower.includes('7th') || lower.includes('class 7')) {
    return 'Class 7';
  }
  if (lower === 'vi' || lower === '6' || lower === '6th' || lower === 'class 6' || lower.includes('6th') || lower.includes('class 6')) {
    return 'Class 6';
  }
  if (lower === 'xii' || lower === '12' || lower === '12th' || lower.includes('syjc') || lower.includes('12th')) {
    return 'SYJC (12th Commerce)';
  }
  if (lower === 'xi' || lower === '11' || lower === '11th' || lower.includes('fyjc') || lower.includes('11th')) {
    return 'FYJC (11th Commerce)';
  }
  return s;
};

export const normalizeCourseName = (standard, courseName) => {
  if (courseName && !courseName.toLowerCase().endsWith('package') && !courseName.toLowerCase().includes('package')) {
    return courseName;
  }
  if (standard.includes('SYJC')) {
    return 'SYJC - COMMERCE (BK, Accounts, Maths, Eco, OCM)';
  }
  if (standard.includes('FYJC')) {
    return 'FYJC - COMMERCE (BK, Accounts, Maths, Eco, OCM)';
  }
  return `${standard} - CBSE / ICSE / SSC (Maths & Science Package)`;
};

export const generateNextReceiptNo = (students = [], currentYear = new Date().getFullYear()) => {
  const pattern = new RegExp(`^SSC-REC-${currentYear}-(\\d+)`, 'i');
  let maxSeq = 0;
  for (const s of students) {
    if (s.receiptNo) {
      const m = s.receiptNo.match(pattern);
      if (m) {
        const num = parseInt(m[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    }
  }
  const nextSeq = maxSeq + 1;
  return `SSC-REC-${currentYear}-${String(nextSeq).padStart(3, '0')}`;
};

// Field Mapping Helpers between camelCase (App) and snake_case (Supabase)
const toAppStudent = (dbRow) => {
  const standard = normalizeStandard(dbRow.standard || 'Class 10');
  const isCollege = standard.includes('SYJC') || standard.includes('FYJC');
  const board = dbRow.board || (isCollege ? 'HSC' : 'CBSE');
  const courseName = normalizeCourseName(standard, dbRow.course_name || dbRow.courseName);
  const admissionDate = normalizeExcelDate(dbRow.admission_date || dbRow.admissionDate);
  const feesDate = normalizeExcelDate(dbRow.fees_date || dbRow.feesDate);
  const reportDate = normalizeExcelDate(dbRow.report_date || dbRow.reportDate);
  const receiptNo = dbRow.receipt_no || dbRow.receiptNo;

  const installments = (dbRow.installments || []).map((inst, idx) => {
    const sNo = inst.srNo || idx + 1;
    const instReceiptNo = inst.receiptNo || (receiptNo ? `${receiptNo}-${String(sNo).padStart(2, '0')}` : '');
    return {
      ...inst,
      srNo: sNo,
      receiptNo: instReceiptNo,
      dueDate: normalizeExcelDate(inst.dueDate),
      paidDate: normalizeExcelDate(inst.paidDate),
    };
  });

  const fatherContact = dbRow.father_contact || dbRow.fatherContact || dbRow.contact_no || dbRow.contactNo || '';
  const motherContact = dbRow.mother_contact || dbRow.motherContact || dbRow.parent_contact || dbRow.parentContact || '';

  return {
    id: dbRow.id,
    receiptNo,
    studentName: dbRow.student_name || dbRow.studentName,
    standard,
    board,
    courseName,
    academicYear: dbRow.academic_year || dbRow.academicYear || '2026-27',
    fatherContact,
    motherContact,
    contactNo: fatherContact,
    parentContact: motherContact,
    admissionDate,
    feesDate,
    reportDate,
    totalFees: parseFloat(dbRow.total_fees || dbRow.totalFees || 0),
    discount: parseFloat(dbRow.discount || 0),
    grandTotal: parseFloat(dbRow.grand_total || dbRow.grandTotal || 0),
    totalPaid: parseFloat(dbRow.total_paid || dbRow.totalPaid || 0),
    balanceLeft: parseFloat(dbRow.balance_left || dbRow.balanceLeft || 0),
    status: dbRow.status || 'PENDING',
    installments,
    notes: dbRow.notes || '',
  };
};

const toDbStudent = (appStudent) => ({
  id: appStudent.id,
  receipt_no: appStudent.receiptNo,
  student_name: appStudent.studentName,
  standard: appStudent.standard,
  board: appStudent.board || 'CBSE',
  course_name: appStudent.courseName,
  academic_year: appStudent.academicYear || '2026-27',
  contact_no: appStudent.fatherContact || appStudent.contactNo || '',
  parent_contact: appStudent.motherContact || appStudent.parentContact || '',
  admission_date: appStudent.admissionDate,
  fees_date: appStudent.feesDate,
  report_date: appStudent.reportDate,
  total_fees: appStudent.totalFees,
  discount: appStudent.discount,
  grand_total: appStudent.grandTotal,
  total_paid: appStudent.totalPaid,
  balance_left: appStudent.balanceLeft,
  status: appStudent.status,
  installments: appStudent.installments || [],
  notes: appStudent.notes || '',
  updated_at: new Date().toISOString(),
});

export const Store = {
  // Local JSON cache getter
  getStudents() {
    if (!fs.existsSync(STUDENTS_FILE)) {
      return [];
    }
    try {
      const data = fs.readFileSync(STUDENTS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (_) {
      return [];
    }
  },

  saveLocalStudents(students) {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2));
  },

  saveStudents(students) {
    this.saveLocalStudents(students);
  },

  async upsertBatchAsync(studentsList) {
    const local = this.getStudents();
    for (const stud of studentsList) {
      const idx = local.findIndex((s) => s.id === stud.id);
      if (idx >= 0) {
        local[idx] = stud;
      } else {
        local.unshift(stud);
      }
    }
    this.saveLocalStudents(local);

    try {
      const dbRecords = studentsList.map(toDbStudent);
      const { error } = await supabase.from('students').upsert(dbRecords);
      if (error) {
        console.error(`⚠️ Supabase batch upload error: ${error.message}`);
      } else {
        console.log(`✅ Batch of ${studentsList.length} students synced to Supabase Database!`);
      }
    } catch (err) {
      console.error('Supabase batch exception:', err.message);
    }
  },

  // Primary: Fetch Live Students directly from Supabase Cloud Database
  async fetchStudentsAsync() {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const appStudents = data.map(toAppStudent);
        this.saveLocalStudents(appStudents);
        return appStudents;
      }
    } catch (err) {
      console.log('Supabase offline, using local cache:', err.message);
    }
    return this.getStudents();
  },

  // Insert or Update directly in Supabase Cloud Database
  async upsertStudentAsync(student) {
    // 1. Update local cache
    const local = this.getStudents();
    const idx = local.findIndex((s) => s.id === student.id);
    if (idx >= 0) {
      local[idx] = student;
    } else {
      local.unshift(student);
    }
    this.saveLocalStudents(local);

    // 2. Persist directly to Supabase Cloud PostgreSQL
    try {
      const dbRecord = toDbStudent(student);
      const { error } = await supabase.from('students').upsert(dbRecord);
      if (error) {
        console.error(`⚠️ Supabase student sync error: ${error.message}`);
      } else {
        console.log(`✅ Student ${student.studentName} [${student.receiptNo}] saved to Supabase Cloud Database!`);
      }
    } catch (err) {
      console.error('Supabase write exception:', err.message);
    }
  },

  // Delete directly from Supabase Cloud Database
  async deleteStudentAsync(id) {
    // 1. Update local cache
    const local = this.getStudents().filter((s) => s.id !== id);
    this.saveLocalStudents(local);

    // 2. Delete permanently from Supabase Cloud PostgreSQL
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) {
        console.error(`⚠️ Supabase delete warning: ${error.message}`);
      } else {
        console.log(`🗑️ Student record [ID: ${id}] permanently deleted from Supabase Cloud Database!`);
      }
    } catch (err) {
      console.error('Supabase delete exception:', err.message);
    }
  },

  // Settings: Local & Supabase Sync
  getSettings() {
    if (!fs.existsSync(SETTINGS_FILE)) {
      this.saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    try {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (_) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  },

  async fetchSettingsAsync() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'default_settings')
        .single();

      if (!error && data) {
        const appSettings = {
          instituteName: data.institute_name,
          tagline: data.tagline,
          address: data.address,
          phone: data.phone,
          email: data.email || '',
          website: data.website,
          receiptPrefix: data.receipt_prefix,
          terms: data.terms || [],
        };
        this.saveSettings(appSettings);
        return appSettings;
      }
    } catch (err) {
      console.log('Using local settings cache:', err.message);
    }
    return this.getSettings();
  },

  async updateSettingsAsync(newSettings) {
    this.saveSettings(newSettings);
    try {
      const dbSettings = {
        id: 'default_settings',
        institute_name: newSettings.instituteName,
        tagline: newSettings.tagline,
        address: newSettings.address,
        phone: newSettings.phone,
        email: newSettings.email || '',
        website: newSettings.website,
        receipt_prefix: newSettings.receiptPrefix,
        terms: newSettings.terms,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('settings').upsert(dbSettings);
      if (error) {
        console.error(`⚠️ Supabase settings update error: ${error.message}`);
      } else {
        console.log('✅ Institute settings updated in Supabase Database!');
      }
    } catch (err) {
      console.error('Supabase settings update exception:', err.message);
    }
  },

  // Business logic calculator
  recalculate(student) {
    const totalFees = parseFloat(student.totalFees || 0);
    const discount = parseFloat(student.discount || 0);
    const grandTotal = Math.max(0, totalFees - discount);

    const installments = student.installments || [];
    const totalPaid = installments.reduce((acc, curr) => {
      return curr.status === 'PAID' ? acc + parseFloat(curr.amount || 0) : acc;
    }, 0);

    const balanceLeft = Math.max(0, grandTotal - totalPaid);

    let status = 'PENDING';
    if (balanceLeft === 0 && grandTotal > 0) {
      status = 'PAID';
    } else if (totalPaid > 0) {
      status = 'PARTIAL';
    }

    return {
      ...student,
      totalFees,
      discount,
      grandTotal,
      totalPaid,
      balanceLeft,
      status,
    };
  },
};
