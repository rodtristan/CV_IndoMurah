import 'package:geolocator/geolocator.dart';

/// Thin wrapper around `geolocator` used to fetch the device's current
/// GPS position when the user performs check-in / check-out.
class LocationService {
  LocationService._internal();

  static final LocationService instance = LocationService._internal();

  /// Ensures location services are enabled and permission is granted.
  /// Throws a [LocationServiceException] describing what went wrong so the
  /// UI layer can show an appropriate message.
  Future<void> ensurePermission() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw const LocationServiceException(
        'Layanan lokasi (GPS) tidak aktif. Aktifkan GPS terlebih dahulu.',
      );
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw const LocationServiceException('Izin lokasi ditolak.');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw const LocationServiceException(
        'Izin lokasi ditolak secara permanen. Aktifkan lewat pengaturan aplikasi.',
      );
    }
  }

  /// Fetches the current GPS position. Call [ensurePermission] first,
  /// or catch [LocationServiceException] thrown from here.
  Future<Position> getCurrentPosition() async {
    await ensurePermission();
    return Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
      ),
    );
  }
}

class LocationServiceException implements Exception {
  final String message;
  const LocationServiceException(this.message);

  @override
  String toString() => message;
}
