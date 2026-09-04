import 'dart:io';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../core/services/location_service.dart';
import '../../models/attendance_model.dart';
import '../../widgets/custom_button.dart';

/// Screen used both for "Absen Masuk" and "Absen Keluar".
///
/// Flow: take a selfie -> fetch current GPS location -> submit.
///
/// TODO: On submit, upload the photo + coordinates to the backend via
/// `ApiService.post(ApiEndpoints.attendanceCheckIn / attendanceCheckOut)`
/// (likely multipart/form-data for the photo). For now this returns a
/// locally-built [AttendanceModel] back to the caller so the Home screen
/// state can be updated for demo purposes.
class CheckInScreen extends StatefulWidget {
  final bool isCheckIn;

  const CheckInScreen({super.key, required this.isCheckIn});

  @override
  State<CheckInScreen> createState() => _CheckInScreenState();
}

class _CheckInScreenState extends State<CheckInScreen> {
  final ImagePicker _picker = ImagePicker();

  XFile? _photo;
  Position? _position;

  bool _isFetchingLocation = false;
  String? _locationError;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _fetchLocation();
  }

  Future<void> _fetchLocation() async {
    setState(() {
      _isFetchingLocation = true;
      _locationError = null;
    });

    try {
      final position = await LocationService.instance.getCurrentPosition();
      if (!mounted) return;
      setState(() => _position = position);
    } on LocationServiceException catch (e) {
      if (!mounted) return;
      setState(() => _locationError = e.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => _locationError = 'Gagal mengambil lokasi.');
    } finally {
      if (mounted) setState(() => _isFetchingLocation = false);
    }
  }

  Future<void> _takeSelfie() async {
    try {
      final photo = await _picker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.front,
        imageQuality: 80,
      );
      if (photo != null) {
        setState(() => _photo = photo);
      }
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal mengambil foto.')),
      );
    }
  }

  bool get _canSubmit => _photo != null && _position != null && !_isSubmitting;

  Future<void> _submit() async {
    if (!_canSubmit) return;

    setState(() => _isSubmitting = true);

    // TODO: replace with real API submission (multipart upload of _photo
    // plus _position.latitude/_position.longitude).
    await Future.delayed(const Duration(milliseconds: 800));

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    final now = DateTime.now();
    final result = AttendanceModel(
      id: 'dummy-${now.millisecondsSinceEpoch}',
      checkInTime: widget.isCheckIn ? now : null,
      checkOutTime: widget.isCheckIn ? null : now,
      checkInPhotoUrl: _photo!.path,
      checkInLat: _position!.latitude,
      checkInLng: _position!.longitude,
      status: widget.isCheckIn ? AttendanceStatus.checkedIn : AttendanceStatus.checkedOut,
    );

    Navigator.of(context).pop(result);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(widget.isCheckIn ? AppStrings.checkInTitle : AppStrings.checkOutTitle),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _PhotoPreview(photo: _photo),
              const SizedBox(height: 12),
              CustomButton(
                label: _photo == null ? AppStrings.takeSelfie : AppStrings.retakePhoto,
                icon: Icons.camera_alt,
                onPressed: _takeSelfie,
              ),
              const SizedBox(height: 24),
              _LocationInfo(
                isLoading: _isFetchingLocation,
                position: _position,
                error: _locationError,
                onRetry: _fetchLocation,
              ),
              const SizedBox(height: 32),
              CustomButton(
                label: AppStrings.submit,
                icon: Icons.check_circle_outline,
                color: AppColors.success,
                isLoading: _isSubmitting,
                onPressed: _canSubmit ? _submit : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PhotoPreview extends StatelessWidget {
  final XFile? photo;

  const _PhotoPreview({required this.photo});

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.grey.shade300,
          borderRadius: BorderRadius.circular(12),
        ),
        clipBehavior: Clip.antiAlias,
        child: photo == null
            ? const Center(
                child: Icon(Icons.person, size: 96, color: Colors.white),
              )
            : Image.file(File(photo!.path), fit: BoxFit.cover),
      ),
    );
  }
}

class _LocationInfo extends StatelessWidget {
  final bool isLoading;
  final Position? position;
  final String? error;
  final VoidCallback onRetry;

  const _LocationInfo({
    required this.isLoading,
    required this.position,
    required this.error,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const Icon(Icons.location_on, color: AppColors.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    AppStrings.currentLocation,
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 4),
                  if (isLoading)
                    const Text(AppStrings.fetchingLocation)
                  else if (error != null)
                    Text(error!, style: const TextStyle(color: AppColors.error))
                  else if (position != null)
                    Text(
                      '${position!.latitude.toStringAsFixed(6)}, '
                      '${position!.longitude.toStringAsFixed(6)}',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    )
                  else
                    const Text('-'),
                ],
              ),
            ),
            if (!isLoading)
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: onRetry,
              ),
          ],
        ),
      ),
    );
  }
}
