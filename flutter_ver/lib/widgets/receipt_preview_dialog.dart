import 'package:flutter/material.dart';
import 'package:printing/printing.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/student.dart';
import '../models/institute_settings.dart';
import '../services/pdf_receipt_service.dart';

class ReceiptPreviewDialog extends StatelessWidget {
  final Student student;
  final InstituteSettings settings;

  const ReceiptPreviewDialog({
    super.key,
    required this.student,
    required this.settings,
  });

  void _shareWhatsApp(BuildContext context) async {
    final contact = student.parentContact.isNotEmpty ? student.parentContact : student.contactNo;
    final phoneClean = contact.replaceAll(RegExp(r'[^0-9]'), '');
    final finalPhone = phoneClean.startsWith('91') ? phoneClean : '91$phoneClean';

    final text = '''*FEE RECEIPT — ${settings.instituteName}*
----------------------------------------
*Student:* ${student.studentName}
*Course:* ${student.courseName}
*Receipt No:* ${student.receiptNo}
*Date:* ${student.feesDate}

*Total Fees:* Rs. ${student.grandTotal.toStringAsFixed(0)}
*Total Paid:* Rs. ${student.totalPaid.toStringAsFixed(0)}
*Balance Due:* Rs. ${student.balanceLeft.toStringAsFixed(0)}

*Payment Status:* ${student.status}
----------------------------------------
Thank you,
*${settings.instituteName}*''';

    final url = Uri.parse('https://wa.me/$finalPhone?text=${Uri.encodeComponent(text)}');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open WhatsApp link')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: SizedBox(
        width: 900,
        height: MediaQuery.of(context).size.height * 0.92,
        child: Column(
          children: [
            // Top Bar
            Container(
              decoration: const BoxDecoration(
                color: Color(0xFF1E3A8A),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
                border: Border(bottom: BorderSide(color: Color(0xFFDC2626), width: 3)),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.receipt_long, color: Colors.white, size: 20),
                      const SizedBox(width: 10),
                      Text(
                        'Fee Receipt: ${student.studentName} (${student.receiptNo})',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      if (student.contactNo.isNotEmpty || student.parentContact.isNotEmpty)
                        OutlinedButton.icon(
                          onPressed: () => _shareWhatsApp(context),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF047857),
                            backgroundColor: const Color(0xFFECFDF5),
                            side: const BorderSide(color: Color(0xFFA7F3D0)),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            visualDensity: VisualDensity.compact,
                          ),
                          icon: const Icon(Icons.share, size: 14),
                          label: const Text('WhatsApp', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                      const SizedBox(width: 8),
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.close, color: Colors.white70),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // PDF Preview Viewer
            Expanded(
              child: PdfPreview(
                build: (format) => PdfReceiptService.generateReceiptPdf(
                  student: student,
                  settings: settings,
                ),
                canChangePageFormat: false,
                canChangeOrientation: false,
                canDebug: false,
                pdfFileName: 'Fee_Receipt_${student.studentName.replaceAll(' ', '_')}_${student.receiptNo}.pdf',
                previewPageMargin: const EdgeInsets.all(16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
