import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import '../models/student.dart';
import '../models/installment.dart';

class StudentFormDialog extends StatefulWidget {
  final Student? studentToEdit;
  final Function(Student) onSave;

  const StudentFormDialog({
    super.key,
    this.studentToEdit,
    required this.onSave,
  });

  @override
  State<StudentFormDialog> createState() => _StudentFormDialogState();
}

class _StudentFormDialogState extends State<StudentFormDialog> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _rollController;
  late TextEditingController _contactController;
  late TextEditingController _parentContactController;
  late TextEditingController _courseController;
  late TextEditingController _academicYearController;
  late TextEditingController _totalFeesController;
  late TextEditingController _discountController;
  late TextEditingController _notesController;

  String _standard = 'SYJC';
  String _admissionDate = '';
  String _feesDate = '';
  String _reportDate = '';

  int _installmentPreset = 5;
  List<Installment> _installments = [];

  final DateFormat _dateFormatter = DateFormat('yyyy-MM-dd');
  final NumberFormat _currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: 'Rs. ', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    final todayStr = _dateFormatter.format(now);

    final s = widget.studentToEdit;
    if (s != null) {
      _nameController = TextEditingController(text: s.studentName);
      _rollController = TextEditingController(text: s.rollNo);
      _contactController = TextEditingController(text: s.contactNo);
      _parentContactController = TextEditingController(text: s.parentContact);
      _courseController = TextEditingController(text: s.courseName);
      _academicYearController = TextEditingController(text: s.academicYear);
      _totalFeesController = TextEditingController(text: s.totalFees.toStringAsFixed(0));
      _discountController = TextEditingController(text: s.discount.toStringAsFixed(0));
      _notesController = TextEditingController(text: s.notes);

      _standard = s.standard;
      _admissionDate = s.admissionDate;
      _feesDate = s.feesDate;
      _reportDate = s.reportDate;
      _installments = List.from(s.installments);
    } else {
      _nameController = TextEditingController();
      _rollController = TextEditingController(text: 'SSC-${now.year}-${(100 + (now.millisecond % 900))}');
      _contactController = TextEditingController();
      _parentContactController = TextEditingController();
      _courseController = TextEditingController(text: 'SYJC - MATHS (2024-25)');
      _academicYearController = TextEditingController(text: '2024-25');
      _totalFeesController = TextEditingController(text: '45000');
      _discountController = TextEditingController(text: '10000');
      _notesController = TextEditingController(text: 'Admitted in regular coaching batch.');

      _admissionDate = todayStr;
      _feesDate = todayStr;
      _reportDate = todayStr;

      _generateInstallments(35000, 7, todayStr, true);
    }
  }

  void _generateInstallments(double netAmount, int count, String baseDateStr, bool firstPaid) {
    final now = DateTime.tryParse(baseDateStr) ?? DateTime.now();
    final c = count.clamp(1, 12);
    final perInst = (netAmount / c).floorToDouble();
    final remainder = netAmount - (perInst * c);

    final List<Installment> newInst = [];
    for (int i = 0; i < c; i++) {
      final dueDate = now.add(Duration(days: i * 30));
      final isPaid = i == 0 && firstPaid;
      final amt = (i == c - 1) ? perInst + remainder : perInst;

      newInst.add(Installment(
        srNo: i + 1,
        dueDate: _dateFormatter.format(dueDate),
        paidDate: isPaid ? _dateFormatter.format(now) : null,
        status: isPaid ? 'PAID' : 'PENDING',
        amount: amt,
        paymentMode: isPaid ? 'Cash' : '',
        transactionDetails: isPaid ? 'Cash' : '',
      ));
    }

    setState(() {
      _installments = newInst;
    });
  }

  void _onFeeChanged() {
    final gross = double.tryParse(_totalFeesController.text) ?? 0.0;
    final disc = double.tryParse(_discountController.text) ?? 0.0;
    final net = (gross - disc).clamp(0.0, double.infinity);
    if (widget.studentToEdit == null) {
      _generateInstallments(net, _installments.isNotEmpty ? _installments.length : _installmentPreset, _feesDate, true);
    } else {
      setState(() {});
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _rollController.dispose();
    _contactController.dispose();
    _parentContactController.dispose();
    _courseController.dispose();
    _academicYearController.dispose();
    _totalFeesController.dispose();
    _discountController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  double get _grossFees => double.tryParse(_totalFeesController.text) ?? 0.0;
  double get _discount => double.tryParse(_discountController.text) ?? 0.0;
  double get _netTotal => (_grossFees - _discount).clamp(0.0, double.infinity);
  double get _totalInstallmentSum => _installments.fold(0.0, (sum, i) => sum + i.amount);
  double get _totalPaidSum => _installments.where((i) => i.isPaid).fold(0.0, (sum, i) => sum + i.amount);
  double get _balanceLeft => (_netTotal - _totalPaidSum).clamp(0.0, double.infinity);

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.studentToEdit != null;

    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: Container(
        width: 860,
        constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.9),
        child: Column(
          children: [
            // Header: Royal Blue with Red accent
            Container(
              decoration: const BoxDecoration(
                color: Color(0xFF1E3A8A),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
                border: Border(bottom: BorderSide(color: Color(0xFFDC2626), width: 3)),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.school, color: Colors.amber, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isEditing ? 'Edit Student: ${_nameController.text}' : 'New Student Admission & Billing Console',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          const Text(
                            'Official Particulars, Fee Structure & Dynamic Installment Plan',
                            style: TextStyle(color: Color(0xFFBFDBFE), fontSize: 11),
                          ),
                        ],
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close, color: Colors.white70),
                  ),
                ],
              ),
            ),

            // Form Body
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Section 1: Student Particulars
                      _buildSectionHeader('1. Student Particulars', Icons.person_outline),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            flex: 2,
                            child: _buildTextField(
                              controller: _nameController,
                              label: 'Student Full Name *',
                              hint: 'e.g. Shreyas Chavan',
                              validator: (val) => val == null || val.trim().isEmpty ? 'Required' : null,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildTextField(
                              controller: _rollController,
                              label: 'Roll / Reg No',
                              hint: 'e.g. SSC-SYJC-042',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _buildTextField(
                              controller: _contactController,
                              label: 'Student Mobile',
                              hint: 'e.g. 9876543210',
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildTextField(
                              controller: _parentContactController,
                              label: 'Parent Mobile',
                              hint: 'e.g. 9876543211',
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildTextField(
                              controller: _academicYearController,
                              label: 'Academic Year',
                              hint: 'e.g. 2024-25',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              initialValue: _standard,
                              decoration: _inputDecoration('Standard / Class'),
                              items: const [
                                DropdownMenuItem(value: 'SYJC', child: Text('SYJC (12th Std)')),
                                DropdownMenuItem(value: 'FYJC', child: Text('FYJC (11th Std)')),
                                DropdownMenuItem(value: 'Class 10', child: Text('Class 10')),
                                DropdownMenuItem(value: 'Class 9', child: Text('Class 9')),
                                DropdownMenuItem(value: 'Degree', child: Text('Degree / B.Com / BMS')),
                                DropdownMenuItem(value: 'Other', child: Text('Other')),
                              ],
                              onChanged: (val) {
                                if (val != null) setState(() => _standard = val);
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            flex: 2,
                            child: _buildTextField(
                              controller: _courseController,
                              label: 'Course / Subjects (Appears on Receipt)',
                              hint: 'e.g. SYJC - MATHS (2023-24)',
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),

                      // Section 2: Fee Structure
                      _buildSectionHeader('2. Fee Structure & Discount', Icons.currency_rupee),
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: _buildTextField(
                                controller: _totalFeesController,
                                label: 'Total Gross Fees (Rs.)',
                                isNumber: true,
                                onChanged: (_) => _onFeeChanged(),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildTextField(
                                controller: _discountController,
                                label: 'Discount Amount (Rs.)',
                                isNumber: true,
                                onChanged: (_) => _onFeeChanged(),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEFF6FF),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: const Color(0xFFBFDBFE)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Net Grand Total', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E3A8A))),
                                    const SizedBox(height: 4),
                                    Text(_currencyFormat.format(_netTotal), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF1E3A8A))),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Section 3: Dynamic Installment Structure
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildSectionHeader('3. Installment Structure & Status', Icons.calendar_month),
                          Row(
                            children: [
                              const Text('Preset: ', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                              const SizedBox(width: 4),
                              DropdownButton<int>(
                                value: _installmentPreset,
                                isDense: true,
                                items: const [
                                  DropdownMenuItem(value: 1, child: Text('1 Full')),
                                  DropdownMenuItem(value: 2, child: Text('2 Inst')),
                                  DropdownMenuItem(value: 3, child: Text('3 Inst')),
                                  DropdownMenuItem(value: 4, child: Text('4 Inst')),
                                  DropdownMenuItem(value: 5, child: Text('5 Inst')),
                                  DropdownMenuItem(value: 7, child: Text('7 Inst')),
                                  DropdownMenuItem(value: 10, child: Text('10 Inst')),
                                ],
                                onChanged: (v) {
                                  if (v != null) {
                                    setState(() => _installmentPreset = v);
                                    _generateInstallments(_netTotal, v, _feesDate, true);
                                  }
                                },
                              ),
                              const SizedBox(width: 8),
                              OutlinedButton(
                                onPressed: () => _generateInstallments(_netTotal, _installmentPreset, _feesDate, true),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: const Color(0xFF1E3A8A),
                                  side: const BorderSide(color: Color(0xFF1E3A8A)),
                                  visualDensity: VisualDensity.compact,
                                ),
                                child: const Text('Auto-Split', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // Installments Table
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          children: [
                            Container(
                              color: const Color(0xFFF1F5F9),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              child: const Row(
                                children: [
                                  SizedBox(width: 30, child: Text('#', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11))),
                                  Expanded(flex: 2, child: Text('Due Date', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11))),
                                  Expanded(flex: 2, child: Text('Amount (Rs)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11))),
                                  Expanded(flex: 2, child: Text('Status', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11))),
                                  Expanded(flex: 2, child: Text('Paid Date', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11))),
                                  Expanded(flex: 2, child: Text('Payment Mode', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11))),
                                  Expanded(flex: 3, child: Text('Transaction Ref / Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11))),
                                  SizedBox(width: 30),
                                ],
                              ),
                            ),
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: _installments.length,
                              separatorBuilder: (_, _) => const Divider(height: 1, color: Color(0xFFE2E8F0)),
                              itemBuilder: (context, idx) {
                                final inst = _installments[idx];
                                return Container(
                                  color: inst.isPaid ? const Color(0xFFECFDF5) : Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  child: Row(
                                    children: [
                                      SizedBox(width: 30, child: Text('${inst.srNo}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11))),
                                      Expanded(
                                        flex: 2,
                                        child: TextFormField(
                                          initialValue: inst.dueDate,
                                          style: const TextStyle(fontSize: 11),
                                          decoration: _cellInputDeco(),
                                          onChanged: (v) {
                                            _installments[idx] = inst.copyWith(dueDate: v);
                                          },
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        flex: 2,
                                        child: TextFormField(
                                          initialValue: inst.amount.toStringAsFixed(0),
                                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                          decoration: _cellInputDeco(),
                                          keyboardType: TextInputType.number,
                                          onChanged: (v) {
                                            final val = double.tryParse(v) ?? 0.0;
                                            setState(() {
                                              _installments[idx] = inst.copyWith(amount: val);
                                            });
                                          },
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        flex: 2,
                                        child: DropdownButtonFormField<String>(
                                          initialValue: inst.status,
                                          decoration: _cellInputDeco(),
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: inst.isPaid ? const Color(0xFF047857) : const Color(0xFFDC2626),
                                          ),
                                          items: const [
                                            DropdownMenuItem(value: 'PAID', child: Text('PAID')),
                                            DropdownMenuItem(value: 'PENDING', child: Text('PENDING')),
                                          ],
                                          onChanged: (v) {
                                            if (v != null) {
                                              setState(() {
                                                final nowStr = _dateFormatter.format(DateTime.now());
                                                _installments[idx] = inst.copyWith(
                                                  status: v,
                                                  paidDate: v == 'PAID' ? (inst.paidDate ?? nowStr) : null,
                                                  paymentMode: v == 'PAID' ? (inst.paymentMode.isNotEmpty ? inst.paymentMode : 'Cash') : '',
                                                  transactionDetails: v == 'PAID' ? (inst.transactionDetails.isNotEmpty ? inst.transactionDetails : 'Cash') : '',
                                                );
                                              });
                                            }
                                          },
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        flex: 2,
                                        child: TextFormField(
                                          initialValue: inst.paidDate ?? '',
                                          enabled: inst.isPaid,
                                          style: const TextStyle(fontSize: 11),
                                          decoration: _cellInputDeco(),
                                          onChanged: (v) {
                                            _installments[idx] = inst.copyWith(paidDate: v);
                                          },
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        flex: 2,
                                        child: DropdownButtonFormField<String>(
                                          initialValue: inst.paymentMode.isNotEmpty ? inst.paymentMode : 'Cash',
                                          decoration: _cellInputDeco(),
                                          style: const TextStyle(fontSize: 11, color: Color(0xFF1E293B)),
                                          items: const [
                                            DropdownMenuItem(value: 'Cash', child: Text('Cash')),
                                            DropdownMenuItem(value: 'UPI', child: Text('UPI')),
                                            DropdownMenuItem(value: 'Net Banking', child: Text('Net Banking')),
                                            DropdownMenuItem(value: 'Cheque', child: Text('Cheque')),
                                          ],
                                          onChanged: inst.isPaid
                                              ? (v) {
                                                  if (v != null) {
                                                    _installments[idx] = inst.copyWith(paymentMode: v);
                                                  }
                                                }
                                              : null,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        flex: 3,
                                        child: TextFormField(
                                          initialValue: inst.transactionDetails,
                                          enabled: inst.isPaid,
                                          style: const TextStyle(fontSize: 11),
                                          decoration: _cellInputDeco(hint: 'Ref ID / Details'),
                                          onChanged: (v) {
                                            _installments[idx] = inst.copyWith(transactionDetails: v);
                                          },
                                        ),
                                      ),
                                      SizedBox(
                                        width: 30,
                                        child: IconButton(
                                          icon: const Icon(Icons.delete_outline, size: 16, color: Color(0xFF94A3B8)),
                                          onPressed: () {
                                            setState(() {
                                              _installments.removeAt(idx);
                                              for (int k = 0; k < _installments.length; k++) {
                                                _installments[k] = _installments[k].copyWith(srNo: k + 1);
                                              }
                                            });
                                          },
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                      ),

                      // Add Row & Financial Summary Bar
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFCBD5E1)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            TextButton.icon(
                              onPressed: () {
                                setState(() {
                                  final nextDate = DateTime.now().add(Duration(days: _installments.length * 30));
                                  _installments.add(Installment(
                                    srNo: _installments.length + 1,
                                    dueDate: _dateFormatter.format(nextDate),
                                    status: 'PENDING',
                                    amount: 5000,
                                  ));
                                });
                              },
                              icon: const Icon(Icons.add, size: 16, color: Color(0xFF1E3A8A)),
                              label: const Text('Add Installment Row', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E3A8A))),
                            ),
                            Row(
                              children: [
                                Text('Total Sum: ${_currencyFormat.format(_totalInstallmentSum)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                                const SizedBox(width: 14),
                                Text('Total Paid: ${_currencyFormat.format(_totalPaidSum)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                                const SizedBox(width: 14),
                                Text('Balance Left: ${_currencyFormat.format(_balanceLeft)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFDC2626))),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Notes
                      _buildTextField(
                        controller: _notesController,
                        label: 'Admission Remarks / Notes (Optional)',
                        hint: 'e.g. Early bird scholarship applied...',
                        maxLines: 2,
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Footer
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: const BoxDecoration(
                color: Color(0xFFF8FAFC),
                border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: TextButton.styleFrom(foregroundColor: const Color(0xFF475569)),
                    child: const Text('Cancel', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton.icon(
                    onPressed: _handleSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E3A8A),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    icon: const Icon(Icons.check, size: 16),
                    label: Text(
                      isEditing ? 'Save Changes' : 'Save & Generate Official Bill',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF1E3A8A)),
        const SizedBox(width: 6),
        Text(
          title,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1E3A8A),
            letterSpacing: 0.5,
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    String? hint,
    bool isNumber = false,
    int maxLines = 1,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: isNumber ? TextInputType.number : TextInputType.text,
      maxLines: maxLines,
      validator: validator,
      onChanged: onChanged,
      style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A), fontWeight: FontWeight.w500),
      decoration: _inputDecoration(label, hint: hint),
    );
  }

  InputDecoration _inputDecoration(String label, {String? hint}) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
      hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF1E3A8A), width: 1.5)),
    );
  }

  InputDecoration _cellInputDeco({String? hint}) {
    return InputDecoration(
      hintText: hint,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
      hintStyle: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(4), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(4), borderSide: const BorderSide(color: Color(0xFFCBD5E1))),
    );
  }

  void _handleSubmit() {
    if (!_formKey.currentState!.validate()) return;

    final uuid = const Uuid();
    final student = Student.create(
      id: widget.studentToEdit?.id ?? 'stud-${uuid.v4()}',
      receiptNo: widget.studentToEdit?.receiptNo ?? 'SSC-REC-${DateTime.now().year}-${(100 + DateTime.now().millisecond % 900)}',
      studentName: _nameController.text.trim(),
      rollNo: _rollController.text.trim(),
      contactNo: _contactController.text.trim(),
      parentContact: _parentContactController.text.trim(),
      academicYear: _academicYearController.text.trim(),
      standard: _standard,
      courseName: _courseController.text.trim(),
      admissionDate: _admissionDate,
      feesDate: _feesDate,
      reportDate: _reportDate,
      totalFees: _grossFees,
      discount: _discount,
      installments: _installments,
      notes: _notesController.text.trim(),
    );

    widget.onSave(student);
    Navigator.of(context).pop();
  }
}
