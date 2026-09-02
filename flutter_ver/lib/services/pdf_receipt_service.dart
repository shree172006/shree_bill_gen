import 'dart:typed_data';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/student.dart';
import '../models/institute_settings.dart';

class PdfReceiptService {
  static final NumberFormat _currencyFormat = NumberFormat.currency(
    locale: 'en_IN',
    symbol: 'Rs. ',
    decimalDigits: 0,
  );

  static String _formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '-';
    try {
      final d = DateTime.parse(dateStr);
      return DateFormat('dd-MMM-yyyy').format(d);
    } catch (_) {
      return dateStr;
    }
  }

  // Build the Fee Receipt PDF Document
  static Future<Uint8List> generateReceiptPdf({
    required Student student,
    required InstituteSettings settings,
  }) async {
    final doc = pw.Document();

    final fontBold = await PdfGoogleFonts.outfitBold();
    final fontRegular = await PdfGoogleFonts.plusJakartaSansRegular();
    final fontSemiBold = await PdfGoogleFonts.plusJakartaSansSemiBold();

    final navyBlue = PdfColor.fromHex('#0f172a');
    final darkBlue = PdfColor.fromHex('#1e3a8a');
    final crimsonRed = PdfColor.fromHex('#dc2626');
    final slateGray = PdfColor.fromHex('#475569');
    final lightBg = PdfColor.fromHex('#f8fafc');
    final borderColor = PdfColor.fromHex('#cbd5e1');

    doc.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(28),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // Header Section
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  // Left Logo & Institute Branding
                  pw.Row(
                    crossAxisAlignment: pw.CrossAxisAlignment.center,
                    children: [
                      pw.Container(
                        width: 44,
                        height: 44,
                        decoration: pw.BoxDecoration(
                          color: darkBlue,
                          borderRadius: const pw.BorderRadius.all(pw.Radius.circular(6)),
                        ),
                        child: pw.Center(
                          child: pw.Text(
                            'SSC',
                            style: pw.TextStyle(
                              color: PdfColors.white,
                              font: fontBold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                      pw.SizedBox(width: 10),
                      pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text(
                            settings.instituteName,
                            style: pw.TextStyle(
                              color: darkBlue,
                              font: fontBold,
                              fontSize: 18,
                              letterSpacing: 0.5,
                            ),
                          ),
                          pw.SizedBox(height: 2),
                          pw.Container(
                            padding: const pw.EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                            decoration: pw.BoxDecoration(
                              color: crimsonRed,
                              borderRadius: const pw.BorderRadius.all(pw.Radius.circular(3)),
                            ),
                            child: pw.Text(
                              'FYJC  •  SYJC  •  B.COM  •  BMS  •  SCIENCE  •  COMMERCE',
                              style: pw.TextStyle(
                                color: PdfColors.white,
                                font: fontBold,
                                fontSize: 7,
                              ),
                            ),
                          ),
                          pw.SizedBox(height: 2),
                          pw.Text(
                            'EXPERIENCE THE TRANSFORMATION',
                            style: pw.TextStyle(
                              color: darkBlue,
                              font: fontSemiBold,
                              fontSize: 7,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Right Subheader
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text(
                        settings.instituteName,
                        style: pw.TextStyle(
                          color: navyBlue,
                          font: fontBold,
                          fontSize: 11,
                        ),
                      ),
                      pw.SizedBox(height: 2),
                      pw.Text(
                        '${student.studentName.toLowerCase()} - ${student.standard} - ${student.courseName}',
                        style: pw.TextStyle(
                          color: slateGray,
                          font: fontRegular,
                          fontSize: 9,
                        ),
                      ),
                      pw.SizedBox(height: 2),
                      pw.Text(
                        'Receipt No: ${student.receiptNo}',
                        style: pw.TextStyle(
                          color: slateGray,
                          font: fontSemiBold,
                          fontSize: 8,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              pw.SizedBox(height: 8),
              pw.Divider(thickness: 1.5, color: navyBlue),

              // Metadata Row
              pw.Padding(
                padding: const pw.EdgeInsets.symmetric(vertical: 4),
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.RichText(
                      text: pw.TextSpan(
                        children: [
                          pw.TextSpan(
                            text: 'Student Name : ',
                            style: pw.TextStyle(font: fontRegular, fontSize: 9, color: slateGray),
                          ),
                          pw.TextSpan(
                            text: student.studentName.toLowerCase(),
                            style: pw.TextStyle(font: fontBold, fontSize: 9, color: navyBlue),
                          ),
                        ],
                      ),
                    ),
                    pw.RichText(
                      text: pw.TextSpan(
                        children: [
                          pw.TextSpan(
                            text: 'Fees Date : ',
                            style: pw.TextStyle(font: fontRegular, fontSize: 9, color: slateGray),
                          ),
                          pw.TextSpan(
                            text: _formatDate(student.feesDate),
                            style: pw.TextStyle(font: fontSemiBold, fontSize: 9, color: navyBlue),
                          ),
                        ],
                      ),
                    ),
                    pw.RichText(
                      text: pw.TextSpan(
                        children: [
                          pw.TextSpan(
                            text: 'Report Date : ',
                            style: pw.TextStyle(font: fontRegular, fontSize: 9, color: slateGray),
                          ),
                          pw.TextSpan(
                            text: _formatDate(student.reportDate),
                            style: pw.TextStyle(font: fontSemiBold, fontSize: 9, color: navyBlue),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              pw.Divider(thickness: 0.5, color: borderColor),
              pw.SizedBox(height: 6),

              // Admission Detail Heading
              pw.Text(
                'Admission Detail',
                style: pw.TextStyle(
                  color: navyBlue,
                  font: fontBold,
                  fontSize: 10,
                ),
              ),
              pw.SizedBox(height: 4),

              // Course Table
              pw.Table(
                border: pw.TableBorder.all(color: borderColor, width: 0.5),
                columnWidths: {
                  0: const pw.FlexColumnWidth(4),
                  1: const pw.FlexColumnWidth(2),
                },
                children: [
                  pw.TableRow(
                    decoration: pw.BoxDecoration(color: lightBg),
                    children: [
                      pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        child: pw.Text('Course Name', style: pw.TextStyle(font: fontBold, fontSize: 9, color: navyBlue)),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        child: pw.Align(
                          alignment: pw.Alignment.centerRight,
                          child: pw.Text('Fees', style: pw.TextStyle(font: fontBold, fontSize: 9, color: navyBlue)),
                        ),
                      ),
                    ],
                  ),
                  pw.TableRow(
                    children: [
                      pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        child: pw.Text(student.courseName, style: pw.TextStyle(font: fontRegular, fontSize: 9)),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        child: pw.Align(
                          alignment: pw.Alignment.centerRight,
                          child: pw.Text(_currencyFormat.format(student.totalFees), style: pw.TextStyle(font: fontSemiBold, fontSize: 9)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              // Fee Breakdown Summary Box (Right aligned)
              pw.Align(
                alignment: pw.Alignment.centerRight,
                child: pw.Container(
                  width: 200,
                  decoration: pw.BoxDecoration(
                    border: pw.Border.all(color: borderColor, width: 0.5),
                  ),
                  child: pw.Column(
                    children: [
                      pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        child: pw.Row(
                          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                          children: [
                            pw.Text('Total Fees', style: pw.TextStyle(font: fontRegular, fontSize: 8.5, color: slateGray)),
                            pw.Text(_currencyFormat.format(student.totalFees), style: pw.TextStyle(font: fontSemiBold, fontSize: 8.5)),
                          ],
                        ),
                      ),
                      pw.Divider(thickness: 0.5, color: borderColor, height: 1),
                      pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        child: pw.Row(
                          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                          children: [
                            pw.Text('Discount', style: pw.TextStyle(font: fontRegular, fontSize: 8.5, color: slateGray)),
                            pw.Text(_currencyFormat.format(student.discount), style: pw.TextStyle(font: fontSemiBold, fontSize: 8.5)),
                          ],
                        ),
                      ),
                      pw.Divider(thickness: 0.5, color: borderColor, height: 1),
                      pw.Container(
                        color: lightBg,
                        padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        child: pw.Row(
                          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                          children: [
                            pw.Text('Grand Total', style: pw.TextStyle(font: fontBold, fontSize: 9, color: navyBlue)),
                            pw.Text(_currencyFormat.format(student.grandTotal), style: pw.TextStyle(font: fontBold, fontSize: 9, color: navyBlue)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              pw.SizedBox(height: 12),

              // Installment Structure Heading
              pw.Text(
                'Installment Structure',
                style: pw.TextStyle(
                  color: navyBlue,
                  font: fontBold,
                  fontSize: 10,
                ),
              ),
              pw.SizedBox(height: 4),

              // Installment Matrix Table
              pw.Table(
                border: pw.TableBorder.all(color: borderColor, width: 0.5),
                columnWidths: {
                  0: const pw.FlexColumnWidth(0.8),
                  1: const pw.FlexColumnWidth(2.0),
                  2: const pw.FlexColumnWidth(2.0),
                  3: const pw.FlexColumnWidth(1.5),
                  4: const pw.FlexColumnWidth(1.8),
                  5: const pw.FlexColumnWidth(3.5),
                },
                children: [
                  pw.TableRow(
                    decoration: pw.BoxDecoration(color: lightBg),
                    children: [
                      pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                        child: pw.Center(child: pw.Text('Sr.No.', style: pw.TextStyle(font: fontBold, fontSize: 8, color: navyBlue))),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                        child: pw.Text('Instalment Date', style: pw.TextStyle(font: fontBold, fontSize: 8, color: navyBlue)),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                        child: pw.Text('Paid Date', style: pw.TextStyle(font: fontBold, fontSize: 8, color: navyBlue)),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                        child: pw.Center(child: pw.Text('Status', style: pw.TextStyle(font: fontBold, fontSize: 8, color: navyBlue))),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                        child: pw.Align(
                          alignment: pw.Alignment.centerRight,
                          child: pw.Text('Amount (Rs.)', style: pw.TextStyle(font: fontBold, fontSize: 8, color: navyBlue)),
                        ),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                        child: pw.Text('Details', style: pw.TextStyle(font: fontBold, fontSize: 8, color: navyBlue)),
                      ),
                    ],
                  ),
                  ...student.installments.map((inst) {
                    final isPaid = inst.isPaid;
                    return pw.TableRow(
                      children: [
                        pw.Padding(
                          padding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 3.5),
                          child: pw.Center(child: pw.Text('${inst.srNo}', style: pw.TextStyle(font: fontSemiBold, fontSize: 8))),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 3.5),
                          child: pw.Text(_formatDate(inst.dueDate), style: pw.TextStyle(font: fontRegular, fontSize: 8)),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 3.5),
                          child: pw.Text(inst.paidDate != null ? _formatDate(inst.paidDate) : '', style: pw.TextStyle(font: fontRegular, fontSize: 8)),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 3.5),
                          child: pw.Center(
                            child: pw.Text(
                              inst.status.toUpperCase(),
                              style: pw.TextStyle(
                                font: fontBold,
                                fontSize: 8,
                                color: isPaid ? navyBlue : slateGray,
                              ),
                            ),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 3.5),
                          child: pw.Align(
                            alignment: pw.Alignment.centerRight,
                            child: pw.Text(
                              inst.amount.toStringAsFixed(0),
                              style: pw.TextStyle(font: fontSemiBold, fontSize: 8),
                            ),
                          ),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 3.5),
                          child: pw.Text(
                            isPaid ? (inst.transactionDetails.isNotEmpty ? inst.transactionDetails : inst.paymentMode) : '',
                            style: pw.TextStyle(font: fontRegular, fontSize: 8),
                          ),
                        ),
                      ],
                    );
                  }),
                ],
              ),

              // Total Paid & Balance Summary Box
              pw.SizedBox(height: 6),
              pw.Align(
                alignment: pw.Alignment.centerRight,
                child: pw.Container(
                  width: 200,
                  decoration: pw.BoxDecoration(
                    border: pw.Border.all(color: borderColor, width: 0.5),
                  ),
                  child: pw.Column(
                    children: [
                      pw.Padding(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        child: pw.Row(
                          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                          children: [
                            pw.Text('Total Paid Amount', style: pw.TextStyle(font: fontSemiBold, fontSize: 8.5)),
                            pw.Text(_currencyFormat.format(student.totalPaid), style: pw.TextStyle(font: fontBold, fontSize: 8.5, color: PdfColor.fromHex('#047857'))),
                          ],
                        ),
                      ),
                      pw.Divider(thickness: 0.5, color: borderColor, height: 1),
                      pw.Container(
                        color: lightBg,
                        padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        child: pw.Row(
                          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                          children: [
                            pw.Text('Balance Left to Pay', style: pw.TextStyle(font: fontBold, fontSize: 8.5)),
                            pw.Text(_currencyFormat.format(student.balanceLeft), style: pw.TextStyle(font: fontBold, fontSize: 8.5, color: crimsonRed)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              pw.Spacer(),

              // Terms & Conditions
              pw.Container(
                padding: const pw.EdgeInsets.only(top: 8),
                decoration: pw.BoxDecoration(
                  border: pw.Border(top: pw.BorderSide(color: borderColor, width: 0.5)),
                ),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: settings.terms.map((term) {
                    return pw.Padding(
                      padding: const pw.EdgeInsets.only(bottom: 2),
                      child: pw.Text(
                        term,
                        style: pw.TextStyle(
                          font: fontRegular,
                          fontSize: 7,
                          color: slateGray,
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),

              pw.SizedBox(height: 25),

              // Signature Row
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    children: [
                      pw.Container(width: 140, height: 1, color: slateGray),
                      pw.SizedBox(height: 3),
                      pw.Text('(Student/Parent Signature)', style: pw.TextStyle(font: fontBold, fontSize: 8, color: navyBlue)),
                    ],
                  ),
                  pw.Column(
                    children: [
                      pw.Container(width: 140, height: 1, color: slateGray),
                      pw.SizedBox(height: 3),
                      pw.Text('(Staff/Authorised Signature)', style: pw.TextStyle(font: fontBold, fontSize: 8, color: navyBlue)),
                    ],
                  ),
                ],
              ),

              pw.SizedBox(height: 10),

              // Bottom Contact line
              pw.Center(
                child: pw.Text(
                  '${settings.address}  •  Tel: ${settings.phone}  •  ${settings.email}',
                  style: pw.TextStyle(font: fontRegular, fontSize: 6.5, color: slateGray),
                ),
              ),
            ],
          );
        },
      ),
    );

    return doc.save();
  }
}
