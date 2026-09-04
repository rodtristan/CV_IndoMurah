// Basic smoke test: verifies the app boots and shows the Login screen.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:toko_cv_indomurah_absensi/main.dart';
import 'package:toko_cv_indomurah_absensi/core/constants/app_strings.dart';

void main() {
  testWidgets('App boots and shows the login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const AbsensiApp());
    await tester.pump();

    expect(find.text(AppStrings.appName), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(2));
    expect(find.widgetWithText(ElevatedButton, AppStrings.loginButton), findsOneWidget);
  });
}
