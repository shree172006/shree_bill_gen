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

// Field Mapping Helpers between camelCase (App) and snake_case (Supabase)
const toAppStudent = (dbRow) => ({
  id: dbRow.id,
  receiptNo: dbRow.receipt_no || dbRow.receiptNo,
  studentName: dbRow.student_name || dbRow.studentName,
  standard: dbRow.standard || 'SYJC (12th Commerce)',
  board: dbRow.board || 'CBSE',
  courseName: dbRow.course_name || dbRow.courseName,
  academicYear: dbRow.academic_year || dbRow.academicYear || '2024-25',
  contactNo: dbRow.contact_no || dbRow.contactNo || '',
  parentContact: dbRow.parent_contact || dbRow.parentContact || '',
  admissionDate: dbRow.admission_date || dbRow.admissionDate,
  feesDate: dbRow.fees_date || dbRow.feesDate,
  reportDate: dbRow.report_date || dbRow.reportDate,
  totalFees: parseFloat(dbRow.total_fees || dbRow.totalFees || 0),
  discount: parseFloat(dbRow.discount || 0),
  grandTotal: parseFloat(dbRow.grand_total || dbRow.grandTotal || 0),
  totalPaid: parseFloat(dbRow.total_paid || dbRow.totalPaid || 0),
  balanceLeft: parseFloat(dbRow.balance_left || dbRow.balanceLeft || 0),
  status: dbRow.status || 'PENDING',
  installments: dbRow.installments || [],
  notes: dbRow.notes || '',
});

const toDbStudent = (appStudent) => ({
  id: appStudent.id,
  receipt_no: appStudent.receiptNo,
  student_name: appStudent.studentName,
  standard: appStudent.standard,
  board: appStudent.board || 'CBSE',
  course_name: appStudent.courseName,
  academic_year: appStudent.academicYear || '2024-25',
  contact_no: appStudent.contactNo || '',
  parent_contact: appStudent.parentContact || '',
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
