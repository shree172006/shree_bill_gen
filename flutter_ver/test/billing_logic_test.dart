import 'package:flutter_test/flutter_test.dart';
import 'package:shree_sai_billing/models/installment.dart';
import 'package:shree_sai_billing/models/student.dart';
import 'package:shree_sai_billing/models/institute_settings.dart';
import 'package:shree_sai_billing/services/excel_service.dart';

void main() {
  group('Shree Sai Billing Logic Tests', () {
    test('Student model calculates grandTotal and balanceLeft correctly', () {
      final installments = [
        Installment(
          srNo: 1,
          dueDate: '2024-06-10',
          paidDate: '2024-06-10',
          status: 'PAID',
          amount: 5000,
          paymentMode: 'Cash',
          transactionDetails: 'Cash payment',
        ),
        Installment(
          srNo: 2,
          dueDate: '2024-07-10',
          paidDate: '2024-07-15',
          status: 'PAID',
          amount: 5000,
          paymentMode: 'UPI',
          transactionDetails: 'UPI/4910293041',
        ),
        Installment(
          srNo: 3,
          dueDate: '2024-08-10',
          status: 'PENDING',
          amount: 5000,
        ),
      ];

      final student = Student.create(
        id: 'test-1',
        receiptNo: 'SSC-REC-2024-099',
        studentName: 'Aarav Mehta',
        rollNo: 'SSC-SYJC-099',
        contactNo: '9820098200',
        standard: 'SYJC',
        courseName: 'SYJC - COMMERCE (2024-25)',
        admissionDate: '2024-06-10',
        feesDate: '2024-06-10',
        reportDate: '2024-06-10',
        totalFees: 20000,
        discount: 5000,
        installments: installments,
      );

      expect(student.grandTotal, 15000.0);
      expect(student.totalPaid, 10000.0);
      expect(student.balanceLeft, 5000.0);
      expect(student.status, 'PARTIAL');
    });

    test('Student status is PAID when balanceLeft is 0', () {
      final installments = [
        Installment(
          srNo: 1,
          dueDate: '2024-06-10',
          paidDate: '2024-06-10',
          status: 'PAID',
          amount: 15000,
          paymentMode: 'Net Banking',
        ),
      ];

      final student = Student.create(
        id: 'test-2',
        receiptNo: 'SSC-REC-2024-100',
        studentName: 'Sanjana Rao',
        rollNo: 'SSC-SYJC-100',
        standard: 'SYJC',
        courseName: 'SYJC - SCIENCE (2024-25)',
        admissionDate: '2024-06-10',
        feesDate: '2024-06-10',
        reportDate: '2024-06-10',
        totalFees: 15000,
        discount: 0,
        installments: installments,
      );

      expect(student.grandTotal, 15000.0);
      expect(student.totalPaid, 15000.0);
      expect(student.balanceLeft, 0.0);
      expect(student.status, 'PAID');
    });

    test('Excel template and export generation produces valid bytes', () {
      final templateBytes = ExcelService.generateTemplate();
      expect(templateBytes.isNotEmpty, true);

      final sampleStudent = Student.create(
        id: 'test-3',
        receiptNo: 'SSC-REC-2024-101',
        studentName: 'Neha Joshi',
        rollNo: 'SSC-FYJC-012',
        standard: 'FYJC',
        courseName: 'FYJC - COMMERCE',
        admissionDate: '2024-07-01',
        feesDate: '2024-07-01',
        reportDate: '2024-07-01',
        totalFees: 30000,
        discount: 2000,
        installments: [
          Installment(
            srNo: 1,
            dueDate: '2024-07-01',
            status: 'PENDING',
            amount: 28000,
          ),
        ],
      );

      final exportBytes = ExcelService.exportStudentsToExcel([sampleStudent]);
      expect(exportBytes.isNotEmpty, true);
    });

    test('InstituteSettings defaults and copyWith work properly', () {
      final settings = InstituteSettings();
      expect(settings.instituteName, 'SHREE SAI CLASSES');
      expect(settings.terms.length, 4);

      final updated = settings.copyWith(instituteName: 'SHREE SAI ACADEMY');
      expect(updated.instituteName, 'SHREE SAI ACADEMY');
      expect(updated.tagline, settings.tagline);
    });
  });
}
