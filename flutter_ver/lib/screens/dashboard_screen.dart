import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import '../providers/billing_provider.dart';
import '../models/student.dart';
import '../widgets/stat_cards_widget.dart';
import '../widgets/student_table_widget.dart';
import '../widgets/student_form_dialog.dart';
import '../widgets/receipt_preview_dialog.dart';
import '../widgets/excel_import_dialog.dart';
import '../widgets/settings_dialog.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  void _openNewStudentDialog(BuildContext context) {
    final provider = context.read<BillingProvider>();
    showDialog(
      context: context,
      builder: (_) => StudentFormDialog(
        onSave: (newStudent) async {
          await provider.addStudent(newStudent);
          if (context.mounted) {
            _openReceiptDialog(context, newStudent);
          }
        },
      ),
    );
  }

  void _openEditStudentDialog(BuildContext context, Student student) {
    final provider = context.read<BillingProvider>();
    showDialog(
      context: context,
      builder: (_) => StudentFormDialog(
        studentToEdit: student,
        onSave: (updated) async {
          await provider.updateStudent(updated);
          if (context.mounted) {
            _openReceiptDialog(context, updated);
          }
        },
      ),
    );
  }

  void _openReceiptDialog(BuildContext context, Student student) {
    final provider = context.read<BillingProvider>();
    showDialog(
      context: context,
      builder: (_) => ReceiptPreviewDialog(
        student: student,
        settings: provider.settings,
      ),
    );
  }

  void _openExcelImportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => const ExcelImportDialog(),
    );
  }

  void _openSettingsDialog(BuildContext context) {
    final provider = context.read<BillingProvider>();
    showDialog(
      context: context,
      builder: (_) => SettingsDialog(
        currentSettings: provider.settings,
        onSave: provider.updateSettings,
      ),
    );
  }

  Future<void> _exportExcel(BuildContext context) async {
    final provider = context.read<BillingProvider>();
    final bytes = provider.exportExcel();

    final path = await FilePicker.platform.saveFile(
      dialogTitle: 'Save Fee Report Excel',
      fileName: 'Shree_Sai_Classes_Fee_Report_${DateTime.now().toIso8601String().split('T').first}.xlsx',
      type: FileType.custom,
      allowedExtensions: ['xlsx'],
      bytes: bytes,
    );

    if (path != null && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Fee Ledger exported to Excel successfully!')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BillingProvider>();
    final settings = provider.settings;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(80),
        child: Column(
          children: [
            // Top Red Academic Accent Strip
            Container(height: 4, color: const Color(0xFFDC2626)),
            Expanded(
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Brand Crest & Name
                    Flexible(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E3A8A),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFF172554), width: 1.5),
                            ),
                            child: const Center(
                              child: Icon(Icons.school, color: Colors.amber, size: 22),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Flexible(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Flexible(
                                      child: Text(
                                        settings.instituteName,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFF0F172A),
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFDC2626),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Text(
                                        'OFFICIAL PORTAL',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 8.5,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                Text(
                                  settings.tagline,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Top Actions
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Export Excel Button
                          OutlinedButton.icon(
                            onPressed: () => _exportExcel(context),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF1E3A8A),
                              backgroundColor: Colors.white,
                              side: const BorderSide(color: Color(0xFFCBD5E1)),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(Icons.download, size: 14),
                            label: const Text('Export', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                          ),
                          const SizedBox(width: 6),

                          // Import Excel Button
                          OutlinedButton.icon(
                            onPressed: () => _openExcelImportDialog(context),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFFDC2626),
                              backgroundColor: Colors.white,
                              side: const BorderSide(color: Color(0xFFCBD5E1)),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(Icons.table_view, size: 14),
                            label: const Text('Import', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                          ),
                          const SizedBox(width: 6),

                          // Settings Button
                          IconButton(
                            onPressed: () => _openSettingsDialog(context),
                            style: IconButton.styleFrom(
                              backgroundColor: Colors.white,
                              side: const BorderSide(color: Color(0xFFE2E8F0)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(Icons.settings_outlined, size: 18, color: Color(0xFF475569)),
                            tooltip: 'Institute Settings',
                          ),
                          const SizedBox(width: 6),

                          // New Student Admission Button (Royal Blue)
                          ElevatedButton.icon(
                            onPressed: () => _openNewStudentDialog(context),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1E3A8A),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              elevation: 1,
                            ),
                            icon: const Icon(Icons.add_circle_outline, size: 15, color: Colors.amber),
                            label: const Text('New Admission', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const Divider(height: 1, color: Color(0xFFE2E8F0)),
          ],
        ),
      ),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Center(
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 1240),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Executive Stat Cards
                      const StatCardsWidget(),

                      const SizedBox(height: 24),

                      // Console Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Student Billing Console',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Manage student admissions, track multi-installment balances, and generate fee receipts.',
                                style: TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                          IconButton(
                            onPressed: provider.init,
                            icon: const Icon(Icons.refresh, size: 20, color: Color(0xFF1E3A8A)),
                            tooltip: 'Refresh Student Roster',
                          ),
                        ],
                      ),

                      const SizedBox(height: 12),

                      // Student Table Roster
                      StudentTableWidget(
                        onViewReceipt: (s) => _openReceiptDialog(context, s),
                        onEditStudent: (s) => _openEditStudentDialog(context, s),
                        onDeleteStudent: (id) async {
                          final confirm = await showDialog<bool>(
                            context: context,
                            builder: (_) => AlertDialog(
                              title: const Text('Delete Student Record?'),
                              content: const Text('Are you sure you want to delete this student record? This action cannot be undone.'),
                              actions: [
                                TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                                ElevatedButton(
                                  onPressed: () => Navigator.pop(context, true),
                                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDC2626), foregroundColor: Colors.white),
                                  child: const Text('Delete'),
                                ),
                              ],
                            ),
                          );
                          if (confirm == true) {
                            await provider.deleteStudent(id);
                          }
                        },
                        onAddNewStudent: () => _openNewStudentDialog(context),
                      ),

                      const SizedBox(height: 32),

                      // Footer
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: Column(
                          children: [
                            Text(
                              '${settings.instituteName} — Official Fee Management & Automated Billing Portal',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Built with Flutter & Dart • Cross-Platform Institutional ERP Engine',
                              style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
    );
  }
}
