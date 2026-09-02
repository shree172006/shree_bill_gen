import 'package:flutter/foundation.dart';
import '../models/student.dart';
import '../models/institute_settings.dart';
import '../services/storage_service.dart';
import '../services/excel_service.dart';
import '../services/pdf_receipt_service.dart';

class BillingProvider extends ChangeNotifier {
  final StorageService _storageService = StorageService();

  List<Student> _students = [];
  InstituteSettings _settings = InstituteSettings();
  bool _isLoading = true;

  String _searchTerm = '';
  String _statusFilter = 'all';
  String _standardFilter = 'all';

  List<Student> get students => _students;
  InstituteSettings get settings => _settings;
  bool get isLoading => _isLoading;

  String get searchTerm => _searchTerm;
  String get statusFilter => _statusFilter;
  String get standardFilter => _standardFilter;

  // Initialize and Load data
  Future<void> init() async {
    _isLoading = true;
    notifyListeners();

    _students = await _storageService.loadStudents();
    _settings = await _storageService.loadSettings();

    _isLoading = false;
    notifyListeners();
  }

  // Filter & Search setters
  void setSearchTerm(String term) {
    _searchTerm = term;
    notifyListeners();
  }

  void setStatusFilter(String status) {
    _statusFilter = status;
    notifyListeners();
  }

  void setStandardFilter(String standard) {
    _standardFilter = standard;
    notifyListeners();
  }

  // Filtered list
  List<Student> get filteredStudents {
    return _students.where((s) {
      final q = _searchTerm.toLowerCase().trim();
      final matchesSearch = q.isEmpty ||
          s.studentName.toLowerCase().contains(q) ||
          s.rollNo.toLowerCase().contains(q) ||
          s.contactNo.toLowerCase().contains(q) ||
          s.courseName.toLowerCase().contains(q) ||
          s.receiptNo.toLowerCase().contains(q);

      final matchesStatus = _statusFilter == 'all' ||
          s.status.toUpperCase() == _statusFilter.toUpperCase();

      final matchesStandard = _standardFilter == 'all' ||
          s.standard == _standardFilter;

      return matchesSearch && matchesStatus && matchesStandard;
    }).toList();
  }

  // Unique Standards list
  List<String> get uniqueStandards {
    return _students.map((s) => s.standard).toSet().toList();
  }

  // Financial Analytics
  double get totalRevenue => _students.fold(0.0, (sum, s) => sum + s.grandTotal);
  double get totalCollected => _students.fold(0.0, (sum, s) => sum + s.totalPaid);
  double get totalBalance => _students.fold(0.0, (sum, s) => sum + s.balanceLeft);
  int get totalStudentsCount => _students.length;
  int get paidCount => _students.where((s) => s.status == 'PAID').length;
  int get partialCount => _students.where((s) => s.status == 'PARTIAL').length;
  int get pendingCount => _students.where((s) => s.status == 'PENDING').length;

  int get recoveryRate => totalRevenue > 0
      ? ((totalCollected / totalRevenue) * 100).round()
      : 0;

  // Student CRUD
  Future<void> addStudent(Student student) async {
    _students.insert(0, student);
    await _storageService.saveStudents(_students);
    notifyListeners();
  }

  Future<void> updateStudent(Student student) async {
    final idx = _students.indexWhere((s) => s.id == student.id);
    if (idx != -1) {
      _students[idx] = student;
      await _storageService.saveStudents(_students);
      notifyListeners();
    }
  }

  Future<void> deleteStudent(String id) async {
    _students.removeWhere((s) => s.id == id);
    await _storageService.saveStudents(_students);
    notifyListeners();
  }

  // Update Settings
  Future<void> updateSettings(InstituteSettings newSettings) async {
    _settings = newSettings;
    await _storageService.saveSettings(_settings);
    notifyListeners();
  }

  // Excel Bulk Import
  Future<int> importExcel(Uint8List bytes) async {
    final imported = ExcelService.parseExcel(bytes);
    if (imported.isNotEmpty) {
      _students.insertAll(0, imported);
      await _storageService.saveStudents(_students);
      notifyListeners();
    }
    return imported.length;
  }

  // Excel Export
  Uint8List exportExcel() {
    return ExcelService.exportStudentsToExcel(filteredStudents);
  }

  // Template Download
  Uint8List getTemplate() {
    return ExcelService.generateTemplate();
  }

  // Generate Receipt PDF
  Future<Uint8List> generateReceiptPdf(Student student) {
    return PdfReceiptService.generateReceiptPdf(
      student: student,
      settings: _settings,
    );
  }
}
