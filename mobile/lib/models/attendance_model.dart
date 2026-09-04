/// Status of a single attendance record.
enum AttendanceStatus {
  notCheckedIn,
  checkedIn,
  checkedOut;

  static AttendanceStatus fromString(String? value) {
    switch (value) {
      case 'checkedIn':
      case 'CHECKED_IN':
        return AttendanceStatus.checkedIn;
      case 'checkedOut':
      case 'CHECKED_OUT':
        return AttendanceStatus.checkedOut;
      default:
        return AttendanceStatus.notCheckedIn;
    }
  }
}

/// Represents a single day's attendance record for an employee.
class AttendanceModel {
  final String id;
  final DateTime? checkInTime;
  final DateTime? checkOutTime;
  final String? checkInPhotoUrl;
  final double? checkInLat;
  final double? checkInLng;
  final AttendanceStatus status;

  const AttendanceModel({
    required this.id,
    this.checkInTime,
    this.checkOutTime,
    this.checkInPhotoUrl,
    this.checkInLat,
    this.checkInLng,
    this.status = AttendanceStatus.notCheckedIn,
  });

  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      id: json['id']?.toString() ?? '',
      checkInTime: json['checkInTime'] != null
          ? DateTime.tryParse(json['checkInTime'].toString())
          : null,
      checkOutTime: json['checkOutTime'] != null
          ? DateTime.tryParse(json['checkOutTime'].toString())
          : null,
      checkInPhotoUrl: json['checkInPhotoUrl']?.toString(),
      checkInLat: (json['checkInLat'] as num?)?.toDouble(),
      checkInLng: (json['checkInLng'] as num?)?.toDouble(),
      status: AttendanceStatus.fromString(json['status']?.toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'checkInTime': checkInTime?.toIso8601String(),
      'checkOutTime': checkOutTime?.toIso8601String(),
      'checkInPhotoUrl': checkInPhotoUrl,
      'checkInLat': checkInLat,
      'checkInLng': checkInLng,
      'status': status.name,
    };
  }
}
