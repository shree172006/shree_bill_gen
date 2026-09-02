import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/student.dart';
import '../providers/billing_provider.dart';

class StudentTableWidget extends StatelessWidget {
  final Function(Student) onViewReceipt;
  final Function(Student) onEditStudent;
  final Function(String) onDeleteStudent;
  final VoidCallback onAddNewStudent;

  const StudentTableWidget({
    super.key,
    required this.onViewReceipt,
    required this.onEditStudent,
    required this.onDeleteStudent,
    required this.onAddNewStudent,
  });

  static final NumberFormat _currencyFormat = NumberFormat.currency(
    locale: 'en_IN',
    symbol: 'Rs. ',
    decimalDigits: 0,
  );

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BillingProvider>();
    final students = provider.filteredStudents;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x060F172A),
            blurRadius: 4,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Control Bar: Search & Filters
          Padding(
            padding: const EdgeInsets.all(16),
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              crossAxisAlignment: WrapCrossAlignment.center,
              alignment: WrapAlignment.spaceBetween,
              children: [
                // Search Box
                SizedBox(
                  width: 320,
                  child: TextField(
                    onChanged: provider.setSearchTerm,
                    decoration: InputDecoration(
                      hintText: 'Search by name, roll no, mobile, course...',
                      hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                      prefixIcon: const Icon(Icons.search, size: 18, color: Color(0xFF64748B)),
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFF1E3A8A), width: 1.5),
                      ),
                    ),
                  ),
                ),

                // Filters
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Status Filter Buttons
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFCBD5E1)),
                      ),
                      padding: const EdgeInsets.all(2),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: ['all', 'PAID', 'PARTIAL', 'PENDING'].map((st) {
                          final isSelected = provider.statusFilter == st;
                          Color activeBg = const Color(0xFF1E3A8A);
                          if (st == 'PAID') activeBg = const Color(0xFF047857);
                          if (st == 'PENDING') activeBg = const Color(0xFFDC2626);

                          return InkWell(
                            onTap: () => provider.setStatusFilter(st),
                            borderRadius: BorderRadius.circular(6),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: isSelected ? activeBg : Colors.transparent,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                st == 'all' ? 'All' : st,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : const Color(0xFF475569),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(width: 8),

                    // Standard Dropdown
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFCBD5E1)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: provider.standardFilter,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                          items: [
                            const DropdownMenuItem(value: 'all', child: Text('All Standards')),
                            ...provider.uniqueStandards.map(
                              (std) => DropdownMenuItem(value: std, child: Text(std)),
                            ),
                          ],
                          onChanged: (val) {
                            if (val != null) provider.setStandardFilter(val);
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          // Table Content
          students.isEmpty
              ? _buildEmptyState()
              : SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: DataTable(
                    headingRowColor: WidgetStateProperty.all(const Color(0xFFF1F5F9)),
                    dataRowMinHeight: 56,
                    dataRowMaxHeight: 64,
                    columnSpacing: 24,
                    horizontalMargin: 20,
                    columns: const [
                      DataColumn(label: Text('STUDENT INFORMATION', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF475569)))),
                      DataColumn(label: Text('COURSE / STANDARD', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF475569)))),
                      DataColumn(label: Text('FEES & DISCOUNT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF475569)))),
                      DataColumn(label: Text('PAID VS BALANCE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF475569)))),
                      DataColumn(label: Text('INSTALLMENTS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF475569)))),
                      DataColumn(label: Text('STATUS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF475569)))),
                      DataColumn(label: Text('ACTIONS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF475569)))),
                    ],
                    rows: students.map((student) {
                      final paidCount = student.installments.where((i) => i.isPaid).length;
                      final totalInst = student.installments.length;
                      final percentPaid = student.grandTotal > 0
                          ? (student.totalPaid / student.grandTotal).clamp(0.0, 1.0)
                          : 1.0;

                      return DataRow(
                        cells: [
                          // Student Information
                          DataCell(
                            Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  student.studentName,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                                ),
                                const SizedBox(height: 2),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF1F5F9),
                                        borderRadius: BorderRadius.circular(4),
                                        border: Border.all(color: const Color(0xFFE2E8F0)),
                                      ),
                                      child: Text(
                                        student.rollNo.isNotEmpty ? student.rollNo : student.receiptNo,
                                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                                      ),
                                    ),
                                    if (student.contactNo.isNotEmpty) ...[
                                      const SizedBox(width: 6),
                                      const Icon(Icons.phone, size: 11, color: Color(0xFF94A3B8)),
                                      const SizedBox(width: 2),
                                      Text(student.contactNo, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                                    ],
                                  ],
                                ),
                              ],
                            ),
                          ),

                          // Course / Standard
                          DataCell(
                            Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(student.courseName, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
                                const SizedBox(height: 2),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFEFF6FF),
                                        borderRadius: BorderRadius.circular(4),
                                        border: Border.all(color: const Color(0xFFBFDBFE)),
                                      ),
                                      child: Text(student.standard, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E3A8A))),
                                    ),
                                    const SizedBox(width: 6),
                                    Text('AY: ${student.academicYear}', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                                  ],
                                ),
                              ],
                            ),
                          ),

                          // Fees & Discount
                          DataCell(
                            Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(_currencyFormat.format(student.grandTotal), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                if (student.discount > 0)
                                  Text(
                                    'Disc: -${_currencyFormat.format(student.discount)}',
                                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF047857)),
                                  ),
                              ],
                            ),
                          ),

                          // Paid vs Balance
                          DataCell(
                            SizedBox(
                              width: 140,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(_currencyFormat.format(student.totalPaid), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                                      Text(
                                        student.balanceLeft > 0 ? _currencyFormat.format(student.balanceLeft) : 'Cleared',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: student.balanceLeft > 0 ? const Color(0xFFDC2626) : const Color(0xFF64748B),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: LinearProgressIndicator(
                                      value: percentPaid,
                                      backgroundColor: const Color(0xFFF1F5F9),
                                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF1E3A8A)),
                                      minHeight: 4,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),

                          // Installments Status
                          DataCell(
                            Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('$paidCount of $totalInst Cleared', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF334155))),
                                const SizedBox(height: 2),
                                Text(
                                  student.balanceLeft > 0 ? 'Due Pending' : 'All Cleared',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: student.balanceLeft > 0 ? const Color(0xFFDC2626) : const Color(0xFF047857),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Status Badge
                          DataCell(
                            _buildStatusBadge(student.status),
                          ),

                          // Actions: Receipt, Edit, Delete
                          DataCell(
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                // Official Receipt Button
                                OutlinedButton.icon(
                                  onPressed: () => onViewReceipt(student),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: const Color(0xFF1E3A8A),
                                    backgroundColor: const Color(0xFFEFF6FF),
                                    side: const BorderSide(color: Color(0xFFBFDBFE)),
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                    visualDensity: VisualDensity.compact,
                                  ),
                                  icon: const Icon(Icons.receipt_long, size: 14),
                                  label: const Text('Receipt', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(width: 6),

                                // Edit Button
                                IconButton(
                                  onPressed: () => onEditStudent(student),
                                  icon: const Icon(Icons.edit_outlined, size: 17, color: Color(0xFF475569)),
                                  tooltip: 'Edit Details & Installments',
                                  visualDensity: VisualDensity.compact,
                                ),

                                // Delete Button
                                IconButton(
                                  onPressed: () => onDeleteStudent(student.id),
                                  icon: const Icon(Icons.delete_outline, size: 17, color: Color(0xFFEF4444)),
                                  tooltip: 'Delete Student',
                                  visualDensity: VisualDensity.compact,
                                ),
                              ],
                            ),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg = const Color(0xFFFEF2F2);
    Color border = const Color(0xFFFECACA);
    Color text = const Color(0xFFDC2626);

    if (status.toUpperCase() == 'PAID') {
      bg = const Color(0xFFECFDF5);
      border = const Color(0xFFA7F3D0);
      text = const Color(0xFF047857);
    } else if (status.toUpperCase() == 'PARTIAL') {
      bg = const Color(0xFFEFF6FF);
      border = const Color(0xFFBFDBFE);
      text = const Color(0xFF1E40AF);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: text),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.all(48),
      child: Column(
        children: [
          const Icon(Icons.school_outlined, size: 48, color: Color(0xFF94A3B8)),
          const SizedBox(height: 12),
          const Text('No Student Records Found', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 4),
          const Text('Try adjusting your search criteria or register a new student admission.', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: onAddNewStudent,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1E3A8A),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            icon: const Icon(Icons.add_circle_outline, size: 16),
            label: const Text('Add First Student', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
          ),
        ],
      ),
    );
  }
}
