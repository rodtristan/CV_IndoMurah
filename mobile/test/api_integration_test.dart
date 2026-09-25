// Uji integrasi terhadap API sungguhan. Dilewati kecuali dijalankan dengan:
//   flutter test test/api_integration_test.dart \
//     --dart-define=API_BASE_URL=http://localhost:5000/api/v1 \
//     --dart-define=IT_USER=<username> --dart-define=IT_PASS=<password> \
//     --dart-define=IT_LAT=<lat kantor> --dart-define=IT_LNG=<lng kantor>
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:image/image.dart' as img;
import 'package:intl/date_symbol_data_local.dart';
import 'package:toko_cv_indomurah_absensi/models/absensi_models.dart';
import 'package:toko_cv_indomurah_absensi/services/api_client.dart';
import 'package:toko_cv_indomurah_absensi/services/photo_service.dart';

const user = String.fromEnvironment('IT_USER');
const pass = String.fromEnvironment('IT_PASS');
final lat = double.tryParse(const String.fromEnvironment('IT_LAT')) ?? 0;
final lng = double.tryParse(const String.fromEnvironment('IT_LNG')) ?? 0;

void main() {
  final skip = user.isEmpty ? 'set --dart-define=IT_USER to run' : false;
  String? token;
  final api = ApiClient(tokenProvider: () async => token);

  setUpAll(() => initializeDateFormatting('id_ID'));

  Future<String> selfie(String name, {required bool offline}) async {
    final raw = Uint8List.fromList(img.encodeJpg(img.Image(width: 1600, height: 1200)));
    final stamped = await PhotoService.instance.stamp(
      raw,
      StampInfo(
        title: 'ABSEN MASUK',
        capturedAt: DateTime.now(),
        latitude: lat,
        longitude: lng,
        accuracy: 12,
        officeName: 'Kantor IT',
        distanceMeters: 3,
        employeeName: 'Tester',
      ),
      offline: offline,
    );
    final f = File('${Directory.systemTemp.path}/$name.jpg')..writeAsBytesSync(stamped);
    return f.path;
  }

  test('login, geofence, clock in/out, offline, history', () async {
    final login = await api.login(user, pass);
    token = login.token;
    expect(login.me.locations, isNotEmpty);

    final path = await selfie('it_in', offline: false);
    final bytes = File(path).lengthSync();
    expect(bytes, lessThan(2 * 1024 * 1024));
    expect(img.decodeJpg(File(path).readAsBytesSync())!.width, lessThanOrEqualTo(1000));

    await expectLater(
      api.clock(kind: ClockKind.clockIn, photoPath: path, latitude: lat + 0.02, longitude: lng,
          accuracy: 10, isMocked: false, offline: false, capturedAt: DateTime.now()),
      throwsA(isA<ApiException>().having((e) => e.statusCode, 'status', 400)),
    );
    await expectLater(
      api.clock(kind: ClockKind.clockIn, photoPath: path, latitude: lat, longitude: lng,
          accuracy: 10, isMocked: true, offline: false, capturedAt: DateTime.now()),
      throwsA(isA<ApiException>().having((e) => e.statusCode, 'status', 400)),
    );

    final ci = await api.clock(kind: ClockKind.clockIn, photoPath: path, latitude: lat, longitude: lng,
        accuracy: 10, isMocked: false, offline: false, capturedAt: DateTime.now());
    expect(ci.checkIn, isNotNull);

    final outPath = await selfie('it_out', offline: true);
    final co = await api.clock(kind: ClockKind.clockOut, photoPath: outPath, latitude: lat, longitude: lng,
        accuracy: 10, isMocked: false, offline: true, capturedAt: DateTime.now());
    expect(co.checkOut, isNotNull);
    expect(co.checkOutOffline, isTrue);

    await expectLater(
      api.clock(kind: ClockKind.clockOut, photoPath: outPath, latitude: lat, longitude: lng,
          accuracy: 10, isMocked: false, offline: true, capturedAt: DateTime.now()),
      throwsA(isA<ApiException>().having((e) => e.statusCode, 'status', 409)),
    );

    final me = await api.me();
    expect(me.today?.checkOut, isNotNull);
    final hist = await api.history(DateTime.now().toIso8601String().substring(0, 7));
    expect(hist, isNotEmpty);
  }, skip: skip);
}
