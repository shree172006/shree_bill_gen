import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/student.dart';
import '../models/installment.dart';
import '../models/institute_settings.dart';

class StorageService {
  static const String _studentsKey = 'shree_sai_students_data_v1';
  static const String _settingsKey = 'shree_sai_settings_data_v1';

  // Initial Seed Data matching reference PDF invoice
  static List<Student> get _seedStudents => [
    Student.create(
      id: 'stud-001',
      receiptNo: 'SSC-REC-2024-001',
      studentName: 'Shreyas Chavan',
      rollNo: 'SSC-SYJC-042',
      contactNo: '9876543210',
      parentContact: '9876543211',
      academicYear: '2023-24',
      standard: 'SYJC',
      courseName: 'SYJC - MATHS (2023-24)',
      subjects: ['Mathematics', 'Statistics'],
      admissionDate: '2023-01-13',
      feesDate: '2023-01-13',
      reportDate: '2023-03-08',
      totalFees: 45000,
      discount: 10000,
      installments: [
        Installment(
          srNo: 1,
          dueDate: '2023-01-13',
          paidDate: '2023-01-13',
          status: 'PAID',
          amount: 5000,
          paymentMode: 'Cash',
          transactionDetails: 'Cash',
        ),
        Installment(
          srNo: 2,
          dueDate: '2023-02-15',
          paidDate: '2023-02-26',
          status: 'PAID',
          amount: 5000,
          paymentMode: 'Net Banking',
          transactionDetails: 'Net Banking : 305605376306',
        ),
        Installment(
          srNo: 3,
          dueDate: '2023-03-15',
          status: 'PENDING',
          amount: 5000,
        ),
        Installment(
          srNo: 4,
          dueDate: '2023-04-15',
          status: 'PENDING',
          amount: 5000,
        ),
        Installment(
          srNo: 5,
          dueDate: '2023-05-15',
          status: 'PENDING',
          amount: 5000,
        ),
        Installment(
          srNo: 6,
          dueDate: '2023-06-15',
          status: 'PENDING',
          amount: 5000,
        ),
        Installment(
          srNo: 7,
          dueDate: '2023-07-15',
          status: 'PENDING',
          amount: 5000,
        ),
      ],
      notes: 'Admitted in regular morning batch. Discount of Rs. 10,000 applied under early bird scholarship.',
    ),
    Student.create(
      id: 'stud-002',
      receiptNo: 'SSC-REC-2024-002',
      studentName: 'Ananya Sharma',
      rollNo: 'SSC-SYJC-015',
      contactNo: '9820123456',
      parentContact: '9820123457',
      academicYear: '2024-25',
      standard: 'SYJC',
      courseName: 'SYJC - COMMERCE FULL PACKAGE (2024-25)',
      subjects: ['Book Keeping', 'Economics', 'OCM', 'SP'],
      admissionDate: '2024-06-10',
      feesDate: '2024-06-10',
      reportDate: '2024-08-15',
      totalFees: 60000,
      discount: 5000,
      installments: [
        Installment(
          srNo: 1,
          dueDate: '2024-06-10',
          paidDate: '2024-06-10',
          status: 'PAID',
          amount: 30000,
          paymentMode: 'UPI',
          transactionDetails: 'UPI : UPI/416287901234/GPay',
        ),
        Installment(
          srNo: 2,
          dueDate: '2024-08-10',
          paidDate: '2024-08-12',
          status: 'PAID',
          amount: 25000,
          paymentMode: 'Net Banking',
          transactionDetails: 'HDFC NEFT #HD98210349',
        ),
      ],
      notes: 'Full fees cleared. Student eligible for test series module.',
    ),
    Student.create(
      id: 'stud-003',
      receiptNo: 'SSC-REC-2024-003',
      studentName: 'Rohan Patil',
      rollNo: 'SSC-FYJC-089',
      contactNo: '9769012345',
      parentContact: '9769012346',
      academicYear: '2024-25',
      standard: 'FYJC',
      courseName: 'FYJC - SCIENCE (PCM + CS) (2024-25)',
      subjects: ['Physics', 'Chemistry', 'Mathematics', 'CS'],
      admissionDate: '2024-07-01',
      feesDate: '2024-07-01',
      reportDate: '2024-09-01',
      totalFees: 50000,
      discount: 0,
      installments: [
        Installment(
          srNo: 1,
          dueDate: '2024-07-01',
          paidDate: '2024-07-01',
          status: 'PAID',
          amount: 15000,
          paymentMode: 'Cheque',
          transactionDetails: 'Cheque #004521 - SBI',
        ),
        Installment(
          srNo: 2,
          dueDate: '2024-09-15',
          status: 'PENDING',
          amount: 15000,
        ),
        Installment(
          srNo: 3,
          dueDate: '2024-11-15',
          status: 'PENDING',
          amount: 20000,
        ),
      ],
      notes: 'Installment 2 due on 15-Sep-2024.',
    ),
  ];

  // Load Students
  Future<List<Student>> loadStudents() async {
    final prefs = await SharedPreferences.getInstance();
    final rawData = prefs.getString(_studentsKey);
    if (rawData == null || rawData.isEmpty) {
      // Save and return seed data on first run
      await saveStudents(_seedStudents);
      return _seedStudents;
    }
    try {
      final List<dynamic> decoded = jsonDecode(rawData);
      return decoded.map((e) => Student.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      return _seedStudents;
    }
  }

  // Save Students
  Future<bool> saveStudents(List<Student> students) async {
    final prefs = await SharedPreferences.getInstance();
    final encoded = jsonEncode(students.map((s) => s.toJson()).toList());
    return prefs.setString(_studentsKey, encoded);
  }

  // Load Settings
  Future<InstituteSettings> loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final rawData = prefs.getString(_settingsKey);
    if (rawData == null || rawData.isEmpty) {
      final defaultSettings = InstituteSettings();
      await saveSettings(defaultSettings);
      return defaultSettings;
    }
    try {
      final Map<String, dynamic> decoded = jsonDecode(rawData);
      return InstituteSettings.fromJson(decoded);
    } catch (e) {
      return InstituteSettings();
    }
  }

  // Save Settings
  Future<bool> saveSettings(InstituteSettings settings) async {
    final prefs = await SharedPreferences.getInstance();
    final encoded = jsonEncode(settings.toJson());
    return prefs.setString(_settingsKey, encoded);
  }
}
