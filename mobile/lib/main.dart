import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'core/constants/app_colors.dart';
import 'core/constants/app_strings.dart';
import 'core/services/auth_storage_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/main_shell.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Loads Indonesian date/time formatting symbols used across the app
  // (e.g. `DateFormat('EEEE, d MMMM y', 'id_ID')` in AttendanceCard).
  await initializeDateFormatting('id_ID', null);
  runApp(const AbsensiApp());
}

/// Root widget for the "Toko CV IndoMurah" employee attendance app.
class AbsensiApp extends StatelessWidget {
  const AbsensiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppStrings.appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          secondary: AppColors.secondary,
        ),
        scaffoldBackgroundColor: AppColors.background,
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        inputDecorationTheme: const InputDecorationTheme(
          filled: true,
          fillColor: AppColors.surface,
        ),
      ),
      home: const _SplashGate(),
    );
  }
}

/// Checks stored-login state before showing anything else. This is the
/// single gate into the app: no token → [LoginScreen], token present →
/// [MainShell]. There is no guest/browse-without-login path.
class _SplashGate extends StatelessWidget {
  const _SplashGate();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: AuthStorageService.instance.isLoggedIn(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Scaffold(
            backgroundColor: AppColors.background,
            body: Center(child: CircularProgressIndicator()),
          );
        }
        return snapshot.data! ? const MainShell() : const LoginScreen();
      },
    );
  }
}
