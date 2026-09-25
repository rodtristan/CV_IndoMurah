import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:image/image.dart' as img;
import 'package:intl/date_symbol_data_local.dart';

import 'package:toko_cv_indomurah_absensi/core/utils/wib.dart';
import 'package:toko_cv_indomurah_absensi/models/absensi_models.dart';
import 'package:toko_cv_indomurah_absensi/services/location_service.dart';
import 'package:toko_cv_indomurah_absensi/services/photo_service.dart';
import 'package:toko_cv_indomurah_absensi/ui/login_page.dart';

const _office = OfficeLocation(
  id: 1,
  name: 'Kantor Pusat',
  latitude: -6.1754,
  longitude: 106.8272,
  radiusMeters: 100,
  workStart: '08:00',
  workEnd: '17:00',
  lateToleranceMinutes: 10,
);

void main() {
  setUpAll(() => initializeDateFormatting('id_ID', null));

  test('haversine ~111 m per 0.001 deg latitude', () {
    final d = haversineMeters(-6.1754, 106.8272, -6.1744, 106.8272);
    expect(d, closeTo(111, 2));
  });

  test('geofence inside / outside', () {
    final inside = LocationService.check([_office], -6.1756, 106.8273);
    expect(inside.inside, isTrue);
    final outside = LocationService.check([_office], -6.1854, 106.8272);
    expect(outside.inside, isFalse);
    expect(outside.distanceMeters, greaterThan(1000));
  });

  test('WIB date key uses UTC+7', () {
    // 2026-09-24 20:00 UTC == 2026-09-25 03:00 WIB
    expect(Wib.dateKey(DateTime.utc(2026, 9, 24, 20)), '2026-09-25');
  });

  test('MeData JSON round trip (offline cache)', () {
    final me = MeData.fromJson({
      'employee': {'id': 7, 'code': 'EMP007', 'name': 'Budi'},
      'locations': [_office.toJson()],
      'today': {
        'id': 1,
        'date': '2026-09-25',
        'checkIn': '2026-09-25T01:05:00.000Z',
        'checkOut': null,
        'checkInOffline': true,
        'checkOutOffline': false,
        'status': {'code': 'PRESENT', 'name': 'Hadir', 'color': '#22c55e'},
        'location': 'Kantor Pusat',
      },
      'serverTime': '2026-09-25T01:06:00.000Z',
      'rules': {'maxGpsAccuracyMeters': 100, 'maxOfflineAgeHours': 72},
    });
    final back = MeData.fromJson(me.toJson());
    expect(back.employee.name, 'Budi');
    expect(back.locations.single.radiusMeters, 100);
    expect(back.today!.checkInOffline, isTrue);
    expect(Wib.time(back.today!.checkIn), '08:05');
    expect(back.rules.maxOfflineAgeHours, 72);
  });

  test('photo stamp resizes and stays well under 2 MB', () async {
    final src = img.Image(width: 1600, height: 1200);
    img.fill(src, color: img.ColorRgb8(120, 160, 200));
    final raw = img.encodeJpg(src, quality: 95);
    final out = await PhotoService.instance.stamp(
      raw,
      StampInfo(
        title: 'ABSEN MASUK',
        capturedAt: DateTime.utc(2026, 9, 25, 1, 5),
        latitude: -6.1754,
        longitude: 106.8272,
        accuracy: 8,
        officeName: 'Kantor Pusat',
        distanceMeters: 12,
        employeeName: 'Budi',
      ),
      offline: true,
    );
    final decoded = img.decodeJpg(out)!;
    expect(decoded.width, 1000);
    expect(out.length, lessThan(2 * 1024 * 1024));
  });

  testWidgets('login page renders', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: LoginPage()));
    expect(find.text('Absensi CV IndoMurah'), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(2));
    expect(find.text('MASUK'), findsOneWidget);
  });
}
