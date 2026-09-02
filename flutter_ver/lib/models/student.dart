import 'installment.dart';

class Student {
  final String id;
  final String receiptNo;
  final String studentName;
  final String rollNo;
  final String contactNo;
  final String parentContact;
  final String academicYear;
  final String standard;
  final String courseName;
  final List<String> subjects;
  final String admissionDate;
  final String feesDate;
  final String reportDate;
  final double totalFees;
  final double discount;
  final double grandTotal;
  final double taxAmount;
  final double baseAmount;
  final double totalPaid;
  final double balanceLeft;
  final String status; // 'PAID', 'PARTIAL', 'PENDING'
  final List<Installment> installments;
  final String notes;

  Student({
    required this.id,
    required this.receiptNo,
    required this.studentName,
    required this.rollNo,
    this.contactNo = '',
    this.parentContact = '',
    this.academicYear = '2024-25',
    this.standard = 'SYJC',
    required this.courseName,
    this.subjects = const [],
    required this.admissionDate,
    required this.feesDate,
    required this.reportDate,
    required this.totalFees,
    this.discount = 0.0,
    required this.grandTotal,
    this.taxAmount = 0.0,
    this.baseAmount = 0.0,
    required this.totalPaid,
    required this.balanceLeft,
    required this.status,
    required this.installments,
    this.notes = '',
  });

  // Calculate financials and status from installments
  factory Student.create({
    required String id,
    required String receiptNo,
    required String studentName,
    required String rollNo,
    String contactNo = '',
    String parentContact = '',
    String academicYear = '2024-25',
    String standard = 'SYJC',
    required String courseName,
    List<String> subjects = const [],
    required String admissionDate,
    required String feesDate,
    required String reportDate,
    required double totalFees,
    double discount = 0.0,
    required List<Installment> installments,
    String notes = '',
    double taxAmount = 0.0,
  }) {
    final netGrandTotal = (totalFees - discount).clamp(0.0, double.infinity);
    double paid = 0.0;
    for (final inst in installments) {
      if (inst.isPaid) {
        paid += inst.amount;
      }
    }
    final balance = (netGrandTotal - paid).clamp(0.0, double.infinity);

    String st = 'PENDING';
    if (balance == 0 && paid > 0) {
      st = 'PAID';
    } else if (paid > 0) {
      st = 'PARTIAL';
    }

    return Student(
      id: id,
      receiptNo: receiptNo,
      studentName: studentName,
      rollNo: rollNo,
      contactNo: contactNo,
      parentContact: parentContact,
      academicYear: academicYear,
      standard: standard,
      courseName: courseName,
      subjects: subjects,
      admissionDate: admissionDate,
      feesDate: feesDate,
      reportDate: reportDate,
      totalFees: totalFees,
      discount: discount,
      grandTotal: netGrandTotal,
      taxAmount: taxAmount,
      baseAmount: netGrandTotal,
      totalPaid: paid,
      balanceLeft: balance,
      status: st,
      installments: installments,
      notes: notes,
    );
  }

  Student copyWith({
    String? id,
    String? receiptNo,
    String? studentName,
    String? rollNo,
    String? contactNo,
    String? parentContact,
    String? academicYear,
    String? standard,
    String? courseName,
    List<String>? subjects,
    String? admissionDate,
    String? feesDate,
    String? reportDate,
    double? totalFees,
    double? discount,
    List<Installment>? installments,
    String? notes,
    double? taxAmount,
  }) {
    final tFees = totalFees ?? this.totalFees;
    final disc = discount ?? this.discount;
    final insts = installments ?? this.installments;

    return Student.create(
      id: id ?? this.id,
      receiptNo: receiptNo ?? this.receiptNo,
      studentName: studentName ?? this.studentName,
      rollNo: rollNo ?? this.rollNo,
      contactNo: contactNo ?? this.contactNo,
      parentContact: parentContact ?? this.parentContact,
      academicYear: academicYear ?? this.academicYear,
      standard: standard ?? this.standard,
      courseName: courseName ?? this.courseName,
      subjects: subjects ?? this.subjects,
      admissionDate: admissionDate ?? this.admissionDate,
      feesDate: feesDate ?? this.feesDate,
      reportDate: reportDate ?? this.reportDate,
      totalFees: tFees,
      discount: disc,
      installments: insts,
      notes: notes ?? this.notes,
      taxAmount: taxAmount ?? this.taxAmount,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'receiptNo': receiptNo,
      'studentName': studentName,
      'rollNo': rollNo,
      'contactNo': contactNo,
      'parentContact': parentContact,
      'academicYear': academicYear,
      'standard': standard,
      'courseName': courseName,
      'subjects': subjects,
      'admissionDate': admissionDate,
      'feesDate': feesDate,
      'reportDate': reportDate,
      'totalFees': totalFees,
      'discount': discount,
      'grandTotal': grandTotal,
      'taxAmount': taxAmount,
      'baseAmount': baseAmount,
      'totalPaid': totalPaid,
      'balanceLeft': balanceLeft,
      'status': status,
      'installments': installments.map((i) => i.toJson()).toList(),
      'notes': notes,
    };
  }

  factory Student.fromJson(Map<String, dynamic> json) {
    final rawInsts = json['installments'] as List<dynamic>? ?? [];
    final installments = rawInsts.map((i) => Installment.fromJson(i as Map<String, dynamic>)).toList();

    final totalFees = (json['totalFees'] is num) ? (json['totalFees'] as num).toDouble() : double.tryParse(json['totalFees']?.toString() ?? '0') ?? 0.0;
    final discount = (json['discount'] is num) ? (json['discount'] as num).toDouble() : double.tryParse(json['discount']?.toString() ?? '0') ?? 0.0;

    return Student.create(
      id: json['id']?.toString() ?? '',
      receiptNo: json['receiptNo']?.toString() ?? '',
      studentName: json['studentName']?.toString() ?? 'Student',
      rollNo: json['rollNo']?.toString() ?? '',
      contactNo: json['contactNo']?.toString() ?? '',
      parentContact: json['parentContact']?.toString() ?? '',
      academicYear: json['academicYear']?.toString() ?? '2024-25',
      standard: json['standard']?.toString() ?? 'SYJC',
      courseName: json['courseName']?.toString() ?? 'Course',
      subjects: (json['subjects'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      admissionDate: json['admissionDate']?.toString() ?? '',
      feesDate: json['feesDate']?.toString() ?? '',
      reportDate: json['reportDate']?.toString() ?? '',
      totalFees: totalFees,
      discount: discount,
      installments: installments,
      notes: json['notes']?.toString() ?? '',
      taxAmount: (json['taxAmount'] is num) ? (json['taxAmount'] as num).toDouble() : 0.0,
    );
  }
}
