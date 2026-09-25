import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'core/constants/app_colors.dart';
import 'services/app_controller.dart';
import 'ui/login_page.dart';
import 'ui/shell_page.dart';

const String kAppName = 'Absensi CV IndoMurah';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('id_ID', null);
  runApp(const AbsensiApp());
  AppController.instance.init();
}

final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();

class AbsensiApp extends StatefulWidget {
  const AbsensiApp({super.key});

  @override
  State<AbsensiApp> createState() => _AbsensiAppState();
}

class _AbsensiAppState extends State<AbsensiApp> {
  final _c = AppController.instance;
  AuthState _last = AuthState.unknown;

  @override
  void initState() {
    super.initState();
    _c.addListener(_onChange);
  }

  @override
  void dispose() {
    _c.removeListener(_onChange);
    super.dispose();
  }

  void _onChange() {
    // On logout / expired session close any open page (e.g. clock screen).
    if (_last == AuthState.loggedIn && _c.authState == AuthState.loggedOut) {
      rootNavigatorKey.currentState?.popUntil((r) => r.isFirst);
    }
    if (_last != _c.authState) {
      _last = _c.authState;
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final Widget home;
    switch (_c.authState) {
      case AuthState.unknown:
        home = const Scaffold(body: Center(child: CircularProgressIndicator()));
      case AuthState.loggedOut:
        home = const LoginPage();
      case AuthState.loggedIn:
        home = const ShellPage();
    }

    return MaterialApp(
      title: kAppName,
      navigatorKey: rootNavigatorKey,
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
          border: OutlineInputBorder(),
        ),
      ),
      home: home,
    );
  }
}
