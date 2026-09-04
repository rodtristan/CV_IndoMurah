import 'package:flutter/material.dart';

/// Centralized color palette for the app.
///
/// Keeping colors here makes it easy to re-theme the app later
/// (e.g. when the design team provides final brand colors).
class AppColors {
  AppColors._();

  static const Color primary = Color(0xFF1565C0);
  static const Color primaryDark = Color(0xFF0D47A1);
  static const Color secondary = Color(0xFFFF8F00);

  static const Color background = Color(0xFFF5F6FA);
  static const Color surface = Color(0xFFFFFFFF);

  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);

  static const Color success = Color(0xFF2E7D32);
  static const Color warning = Color(0xFFF9A825);
  static const Color error = Color(0xFFC62828);

  static const Color checkedIn = Color(0xFF2E7D32);
  static const Color checkedOut = Color(0xFF616161);
  static const Color notYetCheckedIn = Color(0xFFC62828);
}
