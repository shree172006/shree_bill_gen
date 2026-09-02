import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'providers/billing_provider.dart';
import 'screens/dashboard_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ShreeSaiBillingApp());
}

class ShreeSaiBillingApp extends StatelessWidget {
  const ShreeSaiBillingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => BillingProvider()..init(),
      child: MaterialApp(
        title: 'Shree Sai Classes — Automated Billing & Fee Console',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF1E3A8A), // Royal Blue
            primary: const Color(0xFF1E3A8A),
            secondary: const Color(0xFFDC2626), // Crimson Red
            surface: Colors.white,
          ),
          scaffoldBackgroundColor: const Color(0xFFF1F5F9),
          textTheme: GoogleFonts.plusJakartaSansTextTheme(
            Theme.of(context).textTheme,
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.white,
            foregroundColor: Color(0xFF0F172A),
            elevation: 0,
          ),
        ),
        home: const DashboardScreen(),
      ),
    );
  }
}
