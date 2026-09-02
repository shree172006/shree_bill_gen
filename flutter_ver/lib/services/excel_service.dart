import 'dart:typed_data';
import 'package:excel/excel.dart';
import 'package:uuid/uuid.dart';
import '../models/student.dart';
import '../models/installment.dart';

class ExcelService {
  // Generate sample template bytes (.xlsx)
  static Uint8List generateTemplate() {
    final excel = Excel.createExcel();
    final sheet = excel['Students_Template'];
    excel.delete('Sheet1');

    final headers = [
      'Student Name',
      'Roll No',
      'Mobile Number',
      'Parent Contact',
      'Standard / Class',
      'Course / Subjects',
      'Academic Year',
      'Total Fees',
      'Discount',
      'Installments Count',
      '1st Installment Paid (Yes/No)',
      '1st Installment Amount Paid',
      '1st Paid Date (YYYY-MM-DD)',
      '1st Payment Mode (Cash/UPI/Net Banking/Cheque)',
      'Transaction Reference / Note',
    ];

    sheet.appendRow(headers.map((h) => TextCellValue(h)).toList());

    final sampleRows = [
      [
        'Rohan Sharma',
        'SSC-2025-010',
        '9820011223',
        '9820044556',
        'SYJC',
        'SYJC - COMMERCE (BK, Eco, OC, SP)',
        '2024-25',
        '50000',
        '5000',
        '5',
        'Yes',
        '10000',
        '2024-06-15',
        'UPI',
        'GPay Ref #4192039401',
      ],
      [
        'Priya Deshmukh',
        'SSC-2025-011',
        '9819922334',
        '9819955667',
        'FYJC',
        'FYJC - SCIENCE (PCM + Bio)',
        '2024-25',
        '45000',
        '0',
        '3',
        'Yes',
        '15000',
        '2024-07-01',
        'Cash',
        'Cash counter payment',
      ],
      [
        'Amit Kulkarni',
        'SSC-2025-012',
        '9876501234',
        '9876509876',
        'Class 10',
        'Class 10 - All Subjects',
        '2024-25',
        '35000',
        '2000',
        '4',
        'No',
        '0',
        '',
        '',
        'Admission confirmed, payment due next week',
      ],
    ];

    for (final row in sampleRows) {
      sheet.appendRow(row.map((cell) => TextCellValue(cell)).toList());
    }

    final bytes = excel.save();
    return Uint8List.fromList(bytes ?? []);
  }

  // Parse uploaded Excel bytes into Student list
  static List<Student> parseExcel(Uint8List bytes) {
    final excel = Excel.decodeBytes(bytes);
    if (excel.tables.isEmpty) return [];

    final sheetName = excel.tables.keys.first;
    final sheet = excel.tables[sheetName];
    if (sheet == null || sheet.maxRows <= 1) return [];

    final rows = sheet.rows;
    if (rows.isEmpty) return [];

    // Extract headers map (lowercased trimmed header -> column index)
    final headerRow = rows[0];
    final Map<String, int> colMap = {};
    for (int i = 0; i < headerRow.length; i++) {
      final val = headerRow[i]?.value?.toString().trim().toLowerCase() ?? '';
      if (val.isNotEmpty) {
        colMap[val] = i;
      }
    }

    String getCell(List<Data?> row, List<String> candidates) {
      for (final cand in candidates) {
        final candLower = cand.toLowerCase();
        for (final entry in colMap.entries) {
          if (entry.key.contains(candLower) || candLower.contains(entry.key)) {
            final colIdx = entry.value;
            if (colIdx < row.length) {
              final cellVal = row[colIdx]?.value?.toString().trim() ?? '';
              if (cellVal.isNotEmpty) return cellVal;
            }
          }
        }
      }
      return '';
    }

    final List<Student> importedStudents = [];
    final uuid = const Uuid();
    final now = DateTime.now();
    final todayStr = "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";

    for (int r = 1; r < rows.length; r++) {
      final row = rows[r];
      final studentName = getCell(row, ['Student Name', 'student', 'name']);
      if (studentName.isEmpty) continue;

      final rollNo = getCell(row, ['Roll No', 'roll']);
      final contactNo = getCell(row, ['Mobile Number', 'mobile', 'phone', 'contact']);
      final parentContact = getCell(row, ['Parent Contact', 'parent phone']);
      final stdVal = getCell(row, ['Standard / Class', 'standard', 'class', 'std']);
      final standard = stdVal.isNotEmpty ? stdVal : 'SYJC';

      final courseVal = getCell(row, ['Course / Subjects', 'course', 'subject']);
      final courseName = courseVal.isNotEmpty ? courseVal : standard;

      final yrVal = getCell(row, ['Academic Year', 'year']);
      final academicYear = yrVal.isNotEmpty ? yrVal : '2024-25';

      final totalFees = double.tryParse(getCell(row, ['Total Fees', 'fees', 'fee'])) ?? 0.0;
      final discount = double.tryParse(getCell(row, ['Discount', 'disc'])) ?? 0.0;
      final net = (totalFees - discount).clamp(0.0, double.infinity);

      final rawCount = int.tryParse(getCell(row, ['Installments Count', 'installments', 'count'])) ?? 1;
      final installmentCount = rawCount.clamp(1, 12);

      final firstPaidRaw = getCell(row, ['1st Installment Paid', '1st paid', 'paid (yes/no)']).toLowerCase();
      final isFirstPaid = firstPaidRaw.contains('yes') || firstPaidRaw.contains('paid') || firstPaidRaw.contains('true') || firstPaidRaw.contains('y');

      final defaultFirstAmount = isFirstPaid ? (net / installmentCount) : 0.0;
      final firstAmount = double.tryParse(getCell(row, ['1st Installment Amount Paid', 'amount paid'])) ?? defaultFirstAmount;
      final paidDateVal = getCell(row, ['1st Paid Date', 'paid date']);
      final paidDate = paidDateVal.isNotEmpty ? paidDateVal : todayStr;
      final paymentModeVal = getCell(row, ['1st Payment Mode', 'payment mode', 'mode']);
      final paymentMode = paymentModeVal.isNotEmpty ? paymentModeVal : (isFirstPaid ? 'Cash' : '');
      final transactionRef = getCell(row, ['Transaction Reference / Note', 'reference', 'note']);

      final List<Installment> installments = [];
      final perInst = (net / installmentCount).floorToDouble();
      final remainder = net - (perInst * installmentCount);

      for (int i = 0; i < installmentCount; i++) {
        final dueDate = now.add(Duration(days: i * 30));
        final dueDateStr = "${dueDate.year}-${dueDate.month.toString().padLeft(2, '0')}-${dueDate.day.toString().padLeft(2, '0')}";
        final amount = (i == installmentCount - 1) ? perInst + remainder : perInst;

        if (i == 0 && isFirstPaid) {
          installments.add(Installment(
            srNo: 1,
            dueDate: todayStr,
            paidDate: paidDate,
            status: 'PAID',
            amount: firstAmount > 0 ? firstAmount : amount,
            paymentMode: paymentMode.isNotEmpty ? paymentMode : 'Cash',
            transactionDetails: transactionRef.isNotEmpty ? transactionRef : paymentMode,
          ));
        } else {
          installments.add(Installment(
            srNo: i + 1,
            dueDate: dueDateStr,
            status: 'PENDING',
            amount: amount,
          ));
        }
      }

      final student = Student.create(
        id: 'stud-${uuid.v4()}',
        receiptNo: 'SSC-REC-${now.year}-${(importedStudents.length + 10).toString().padLeft(3, '0')}',
        studentName: studentName,
        rollNo: rollNo.isNotEmpty ? rollNo : 'SSC-${(importedStudents.length + 10).toString().padLeft(3, '0')}',
        contactNo: contactNo,
        parentContact: parentContact,
        academicYear: academicYear,
        standard: standard,
        courseName: courseName,
        admissionDate: todayStr,
        feesDate: todayStr,
        reportDate: todayStr,
        totalFees: totalFees,
        discount: discount,
        installments: installments,
        notes: transactionRef.isNotEmpty ? transactionRef : 'Imported via Excel spreadsheet',
      );

      importedStudents.add(student);
    }

    return importedStudents;
  }

  // Export students to formatted Excel ledger (.xlsx)
  static Uint8List exportStudentsToExcel(List<Student> students) {
    final excel = Excel.createExcel();
    final sheet = excel['Fee_Report'];
    excel.delete('Sheet1');

    final headers = [
      'Sr No',
      'Receipt No',
      'Student Name',
      'Roll No',
      'Standard / Class',
      'Course Name',
      'Academic Year',
      'Contact No',
      'Parent Contact',
      'Total Fees (Rs)',
      'Discount (Rs)',
      'Net Fees (Rs)',
      'Total Paid (Rs)',
      'Balance Left (Rs)',
      'Payment Status',
      'Installments Cleared',
      'Admission Date',
    ];

    sheet.appendRow(headers.map((h) => TextCellValue(h)).toList());

    for (int i = 0; i < students.length; i++) {
      final s = students[i];
      final paidCount = s.installments.where((inst) => inst.isPaid).length;
      final totalInst = s.installments.length;

      sheet.appendRow([
        TextCellValue('${i + 1}'),
        TextCellValue(s.receiptNo),
        TextCellValue(s.studentName),
        TextCellValue(s.rollNo),
        TextCellValue(s.standard),
        TextCellValue(s.courseName),
        TextCellValue(s.academicYear),
        TextCellValue(s.contactNo),
        TextCellValue(s.parentContact),
        TextCellValue(s.totalFees.toStringAsFixed(0)),
        TextCellValue(s.discount.toStringAsFixed(0)),
        TextCellValue(s.grandTotal.toStringAsFixed(0)),
        TextCellValue(s.totalPaid.toStringAsFixed(0)),
        TextCellValue(s.balanceLeft.toStringAsFixed(0)),
        TextCellValue(s.status),
        TextCellValue('$paidCount / $totalInst'),
        TextCellValue(s.admissionDate),
      ]);
    }

    final bytes = excel.save();
    return Uint8List.fromList(bytes ?? []);
  }
}
