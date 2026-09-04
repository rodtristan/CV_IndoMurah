// Basic smoke test: pastikan LoginScreen bisa dibangun dan menampilkan
// form login tanpa error. Diuji langsung (bukan lewat ShopApp) supaya tidak
// bergantung pada platform channel flutter_secure_storage yang tidak
// tersedia di lingkungan widget test.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:toko_cv_indomurah_shop/screens/auth/login_screen.dart';

void main() {
  testWidgets('LoginScreen menampilkan form login', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: LoginScreen()));

    expect(find.text('Masuk'), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(2));
  });
}
