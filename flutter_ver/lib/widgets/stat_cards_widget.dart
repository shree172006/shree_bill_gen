import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/billing_provider.dart';

class StatCardsWidget extends StatelessWidget {
  const StatCardsWidget({super.key});

  static final NumberFormat _currencyFormat = NumberFormat.currency(
    locale: 'en_IN',
    symbol: 'Rs. ',
    decimalDigits: 0,
  );

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BillingProvider>();

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 900;
        final cardWidth = isWide
            ? (constraints.maxWidth - 48) / 4
            : (constraints.maxWidth > 550
                ? (constraints.maxWidth - 16) / 2
                : constraints.maxWidth);

        return Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            _buildCard(
              width: cardWidth,
              topColor: const Color(0xFF1E3A8A), // Navy Blue
              iconBg: const Color(0xFFEFF6FF),
              iconColor: const Color(0xFF1E3A8A),
              icon: Icons.currency_rupee,
              label: 'TOTAL FEES REVENUE',
              value: _currencyFormat.format(provider.totalRevenue),
              subWidget: Text(
                '${provider.totalStudentsCount} enrolled students',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF475569),
                ),
              ),
            ),
            _buildCard(
              width: cardWidth,
              topColor: const Color(0xFF047857), // Emerald Green
              iconBg: const Color(0xFFECFDF5),
              iconColor: const Color(0xFF047857),
              icon: Icons.trending_up,
              label: 'FEES COLLECTED',
              value: _currencyFormat.format(provider.totalCollected),
              valueColor: const Color(0xFF047857),
              subWidget: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Recovery', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                      Text('${provider.recoveryRate}%', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                    ],
                  ),
                  const SizedBox(height: 4),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: provider.recoveryRate / 100.0,
                      backgroundColor: const Color(0xFFE2E8F0),
                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF047857)),
                      minHeight: 5,
                    ),
                  ),
                ],
              ),
            ),
            _buildCard(
              width: cardWidth,
              topColor: const Color(0xFFDC2626), // Crimson Red
              iconBg: const Color(0xFFFEF2F2),
              iconColor: const Color(0xFFDC2626),
              icon: Icons.warning_amber_rounded,
              label: 'BALANCE LEFT TO PAY',
              value: _currencyFormat.format(provider.totalBalance),
              valueColor: const Color(0xFFDC2626),
              subWidget: Text(
                '${provider.partialCount + provider.pendingCount} students with dues',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFDC2626),
                ),
              ),
            ),
            _buildCard(
              width: cardWidth,
              topColor: const Color(0xFF1E40AF), // Royal Blue
              iconBg: const Color(0xFFF1F5F9),
              iconColor: const Color(0xFF1E40AF),
              icon: Icons.people_alt_outlined,
              label: 'FEE STATUS ROSTER',
              value: '${provider.paidCount} / ${provider.totalStudentsCount}',
              subWidget: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('✓ ${provider.paidCount} Paid', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                  Text('⏳ ${provider.partialCount} Partial', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E3A8A))),
                  Text('⚠️ ${provider.pendingCount} Due', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFDC2626))),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildCard({
    required double width,
    required Color topColor,
    required Color iconBg,
    required Color iconColor,
    required IconData icon,
    required String label,
    required String value,
    Color? valueColor,
    required Widget subWidget,
  }) {
    return Container(
      width: width,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x080F172A),
            blurRadius: 4,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top accent bar
          Container(
            height: 4,
            decoration: BoxDecoration(
              color: topColor,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF64748B),
                        letterSpacing: 0.5,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: iconBg,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(icon, size: 20, color: iconColor),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: valueColor ?? const Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 12),
                subWidget,
              ],
            ),
          ),
        ],
      ),
    );
  }
}
