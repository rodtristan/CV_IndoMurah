import 'dart:isolate';
import 'dart:typed_data';

import 'package:image/image.dart' as img;
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import '../core/utils/wib.dart';

/// Text burned into the selfie ("timestamp foto").
class StampInfo {
  final String title; // e.g. "ABSEN MASUK"
  final DateTime capturedAt;
  final double latitude;
  final double longitude;
  final double accuracy;
  final String officeName;
  final double? distanceMeters;
  final String employeeName;

  const StampInfo({
    required this.title,
    required this.capturedAt,
    required this.latitude,
    required this.longitude,
    required this.accuracy,
    required this.officeName,
    required this.distanceMeters,
    required this.employeeName,
  });

  /// Lines are formatted on the main isolate (locale data lives there).
  List<String> lines({required bool offline}) {
    final wib = Wib.toWib(capturedAt);
    final date = DateFormat('EEEE, dd-MM-yyyy', 'id_ID').format(wib);
    final time = DateFormat('HH:mm:ss').format(wib);
    final dist = distanceMeters == null ? '' : ' (${distanceMeters!.round()} m)';
    return [
      'CV IndoMurah - $title${offline ? '  [OFFLINE]' : ''}',
      '$date  $time WIB',
      'Nama  : $employeeName',
      'Kantor: $officeName$dist',
      'Lokasi: ${latitude.toStringAsFixed(6)}, ${longitude.toStringAsFixed(6)}'
          ' (akurasi ${accuracy.round()} m)',
    ];
  }
}

class PhotoService {
  PhotoService._();
  static final PhotoService instance = PhotoService._();

  final _picker = ImagePicker();

  /// Opens the camera (front camera preferred). Gallery is intentionally not
  /// offered so an old photo cannot be reused. Returns null if cancelled.
  Future<Uint8List?> takeSelfie() async {
    final file = await _picker.pickImage(
      source: ImageSource.camera,
      preferredCameraDevice: CameraDevice.front,
      maxWidth: 1600,
      maxHeight: 1600,
      imageQuality: 92,
      requestFullMetadata: false,
    );
    if (file == null) return null;
    return file.readAsBytes();
  }

  /// Resizes to max 1000 px, burns the watermark and encodes as JPEG q80.
  /// Runs in a background isolate so the UI stays responsive.
  Future<Uint8List> stamp(Uint8List raw, StampInfo info,
      {required bool offline}) {
    final lines = info.lines(offline: offline);
    return _runStamp(raw, lines, offline);
  }
}

// Top-level so the isolate closure captures only sendable values.
Future<Uint8List> _runStamp(Uint8List raw, List<String> lines, bool offline) =>
    Isolate.run(() => _stampSync(raw, lines, offline));

String _ascii(String s) =>
    String.fromCharCodes(s.runes.map((c) => (c >= 32 && c < 127) ? c : 63));

Uint8List _stampSync(Uint8List raw, List<String> lines, bool offline) {
  final decoded = img.decodeImage(raw);
  if (decoded == null) {
    throw Exception('Foto tidak dapat dibaca. Silakan ambil ulang.');
  }
  var image = img.bakeOrientation(decoded);

  const maxSide = 1000;
  if (image.width > maxSide || image.height > maxSide) {
    image = image.width >= image.height
        ? img.copyResize(image,
            width: maxSide, interpolation: img.Interpolation.average)
        : img.copyResize(image,
            height: maxSide, interpolation: img.Interpolation.average);
  }

  final font = image.width >= 600 ? img.arial24 : img.arial14;
  final lineH = font.lineHeight > 0 ? font.lineHeight : font.size + 4;
  final pad = (image.width * 0.025).round().clamp(8, 24);
  // Rough width per glyph for truncating long lines.
  final maxChars = ((image.width - pad * 2) / (font.size * 0.55)).floor();

  final texts = lines.map((l) {
    final a = _ascii(l);
    return a.length > maxChars ? '${a.substring(0, maxChars - 3)}...' : a;
  }).toList();

  final boxH = texts.length * lineH + pad * 2;
  final top = image.height - boxH;
  img.fillRect(
    image,
    x1: 0,
    y1: top,
    x2: image.width - 1,
    y2: image.height - 1,
    color: img.ColorRgba8(0, 0, 0, 150),
  );

  for (var i = 0; i < texts.length; i++) {
    final isTitle = i == 0;
    img.drawString(
      image,
      texts[i],
      font: font,
      x: pad,
      y: top + pad + i * lineH,
      color: isTitle && offline
          ? img.ColorRgb8(255, 200, 0)
          : img.ColorRgb8(255, 255, 255),
    );
  }

  return img.encodeJpg(image, quality: 80);
}
