import 'package:geolocator/geolocator.dart';

import '../core/utils/wib.dart';
import '../models/absensi_models.dart';

class LocationServiceException implements Exception {
  final String message;
  const LocationServiceException(this.message);

  @override
  String toString() => message;
}

/// Result of checking a position against the allowed offices.
class GeofenceResult {
  final OfficeLocation? office;
  final double? distanceMeters;
  final bool inside;

  const GeofenceResult({this.office, this.distanceMeters, this.inside = false});

  static const none = GeofenceResult();
}

class LocationService {
  LocationService._();
  static final LocationService instance = LocationService._();

  /// Ensures GPS is on and permission is granted, otherwise throws a
  /// [LocationServiceException] with an Indonesian message.
  Future<void> ensurePermission() async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      throw const LocationServiceException(
        'GPS / layanan lokasi tidak aktif. Aktifkan lokasi di HP Anda lalu coba lagi.',
      );
    }
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied) {
      throw const LocationServiceException(
        'Izin lokasi ditolak. Absensi membutuhkan izin lokasi.',
      );
    }
    if (permission == LocationPermission.deniedForever) {
      throw const LocationServiceException(
        'Izin lokasi ditolak permanen. Buka Pengaturan HP > Aplikasi > Absensi > Izin, lalu izinkan Lokasi.',
      );
    }
  }

  /// Current position with high accuracy (fresh fix, not last-known).
  Future<Position> currentPosition() async {
    await ensurePermission();
    try {
      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.best,
          timeLimit: Duration(seconds: 30),
        ),
      );
    } catch (_) {
      throw const LocationServiceException(
        'Gagal mendapatkan lokasi GPS. Pastikan Anda berada di tempat terbuka lalu coba lagi.',
      );
    }
  }

  /// Live position updates for the home screen distance indicator.
  Stream<Position> positionStream() => Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 3,
        ),
      );

  Future<bool> openSettings() => Geolocator.openAppSettings();
  Future<bool> openLocationSettings() => Geolocator.openLocationSettings();

  /// Finds the office that best matches [lat]/[lng]: the nearest office whose
  /// radius contains the point, or otherwise simply the nearest office.
  static GeofenceResult check(
      List<OfficeLocation> offices, double lat, double lng) {
    if (offices.isEmpty) return GeofenceResult.none;
    OfficeLocation? bestInside;
    double bestInsideDist = double.infinity;
    OfficeLocation? nearest;
    double nearestDist = double.infinity;
    for (final o in offices) {
      final d = haversineMeters(lat, lng, o.latitude, o.longitude);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = o;
      }
      if (d <= o.radiusMeters && d < bestInsideDist) {
        bestInsideDist = d;
        bestInside = o;
      }
    }
    if (bestInside != null) {
      return GeofenceResult(
          office: bestInside, distanceMeters: bestInsideDist, inside: true);
    }
    return GeofenceResult(
        office: nearest, distanceMeters: nearestDist, inside: false);
  }
}
