// Data models matching the /api/v1/attendance-mobile contract.
//
// Every model can be serialized back to JSON so the last /me response can be
// cached on disk and the home screen keeps working offline.

double _toDouble(dynamic v, [double fallback = 0]) {
  if (v == null) return fallback;
  if (v is num) return v.toDouble();
  return double.tryParse(v.toString()) ?? fallback;
}

int _toInt(dynamic v, [int fallback = 0]) {
  if (v == null) return fallback;
  if (v is num) return v.toInt();
  return int.tryParse(v.toString()) ?? fallback;
}

DateTime? _toDate(dynamic v) =>
    v == null ? null : DateTime.tryParse(v.toString());

class Employee {
  final int id;
  final String code;
  final String name;

  const Employee({required this.id, required this.code, required this.name});

  factory Employee.fromJson(Map<String, dynamic> j) => Employee(
        id: _toInt(j['id']),
        code: (j['code'] ?? '').toString(),
        name: (j['name'] ?? '').toString(),
      );

  Map<String, dynamic> toJson() => {'id': id, 'code': code, 'name': name};
}

class OfficeLocation {
  final int id;
  final String name;
  final String? address;
  final double latitude;
  final double longitude;
  final int radiusMeters;
  final String workStart;
  final String workEnd;
  final int lateToleranceMinutes;

  const OfficeLocation({
    required this.id,
    required this.name,
    this.address,
    required this.latitude,
    required this.longitude,
    required this.radiusMeters,
    required this.workStart,
    required this.workEnd,
    required this.lateToleranceMinutes,
  });

  factory OfficeLocation.fromJson(Map<String, dynamic> j) => OfficeLocation(
        id: _toInt(j['id']),
        name: (j['name'] ?? '').toString(),
        address: j['address']?.toString(),
        latitude: _toDouble(j['latitude']),
        longitude: _toDouble(j['longitude']),
        radiusMeters: _toInt(j['radiusMeters'], 100),
        workStart: (j['workStart'] ?? '08:00').toString(),
        workEnd: (j['workEnd'] ?? '17:00').toString(),
        lateToleranceMinutes: _toInt(j['lateToleranceMinutes']),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        'radiusMeters': radiusMeters,
        'workStart': workStart,
        'workEnd': workEnd,
        'lateToleranceMinutes': lateToleranceMinutes,
      };
}

class AttendanceStatus {
  final String code;
  final String name;
  final String? color;

  const AttendanceStatus({required this.code, required this.name, this.color});

  factory AttendanceStatus.fromJson(Map<String, dynamic> j) => AttendanceStatus(
        code: (j['code'] ?? '').toString(),
        name: (j['name'] ?? '').toString(),
        color: j['color']?.toString(),
      );

  Map<String, dynamic> toJson() => {'code': code, 'name': name, 'color': color};
}

class Attendance {
  final int id;

  /// WIB date, `YYYY-MM-DD`.
  final String date;
  final DateTime? checkIn;
  final DateTime? checkOut;
  final bool checkInOffline;
  final bool checkOutOffline;
  final int? checkInDistance;
  final int? checkOutDistance;
  final AttendanceStatus? status;
  final String? location;

  const Attendance({
    required this.id,
    required this.date,
    this.checkIn,
    this.checkOut,
    this.checkInOffline = false,
    this.checkOutOffline = false,
    this.checkInDistance,
    this.checkOutDistance,
    this.status,
    this.location,
  });

  factory Attendance.fromJson(Map<String, dynamic> j) => Attendance(
        id: _toInt(j['id']),
        date: (j['date'] ?? '').toString().split('T').first,
        checkIn: _toDate(j['checkIn']),
        checkOut: _toDate(j['checkOut']),
        checkInOffline: j['checkInOffline'] == true,
        checkOutOffline: j['checkOutOffline'] == true,
        checkInDistance:
            j['checkInDistance'] == null ? null : _toInt(j['checkInDistance']),
        checkOutDistance:
            j['checkOutDistance'] == null ? null : _toInt(j['checkOutDistance']),
        status: j['status'] is Map<String, dynamic>
            ? AttendanceStatus.fromJson(j['status'] as Map<String, dynamic>)
            : null,
        location: j['location']?.toString(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'date': date,
        'checkIn': checkIn?.toUtc().toIso8601String(),
        'checkOut': checkOut?.toUtc().toIso8601String(),
        'checkInOffline': checkInOffline,
        'checkOutOffline': checkOutOffline,
        'checkInDistance': checkInDistance,
        'checkOutDistance': checkOutDistance,
        'status': status?.toJson(),
        'location': location,
      };
}

class AttendanceRules {
  final double maxGpsAccuracyMeters;
  final int maxOfflineAgeHours;

  const AttendanceRules({
    this.maxGpsAccuracyMeters = 100,
    this.maxOfflineAgeHours = 72,
  });

  factory AttendanceRules.fromJson(Map<String, dynamic>? j) => AttendanceRules(
        maxGpsAccuracyMeters: _toDouble(j?['maxGpsAccuracyMeters'], 100),
        maxOfflineAgeHours: _toInt(j?['maxOfflineAgeHours'], 72),
      );

  Map<String, dynamic> toJson() => {
        'maxGpsAccuracyMeters': maxGpsAccuracyMeters,
        'maxOfflineAgeHours': maxOfflineAgeHours,
      };
}

/// Response of GET /me (and of /login minus the token).
class MeData {
  final Employee employee;
  final List<OfficeLocation> locations;
  final Attendance? today;
  final DateTime? serverTime;
  final AttendanceRules rules;

  /// Device time when this data was fetched (used to show "data terakhir").
  final DateTime fetchedAt;

  const MeData({
    required this.employee,
    required this.locations,
    required this.today,
    required this.serverTime,
    required this.rules,
    required this.fetchedAt,
  });

  factory MeData.fromJson(Map<String, dynamic> j, {DateTime? fetchedAt}) =>
      MeData(
        employee: Employee.fromJson(
            (j['employee'] as Map?)?.cast<String, dynamic>() ?? const {}),
        locations: ((j['locations'] as List?) ?? const [])
            .whereType<Map>()
            .map((e) => OfficeLocation.fromJson(e.cast<String, dynamic>()))
            .toList(),
        today: j['today'] is Map
            ? Attendance.fromJson((j['today'] as Map).cast<String, dynamic>())
            : null,
        serverTime: _toDate(j['serverTime']),
        rules: AttendanceRules.fromJson(
            (j['rules'] as Map?)?.cast<String, dynamic>()),
        fetchedAt: fetchedAt ??
            _toDate(j['_fetchedAt'])?.toLocal() ??
            DateTime.now(),
      );

  Map<String, dynamic> toJson() => {
        'employee': employee.toJson(),
        'locations': locations.map((e) => e.toJson()).toList(),
        'today': today?.toJson(),
        'serverTime': serverTime?.toUtc().toIso8601String(),
        'rules': rules.toJson(),
        '_fetchedAt': fetchedAt.toUtc().toIso8601String(),
      };

  MeData copyWith({Attendance? today}) => MeData(
        employee: employee,
        locations: locations,
        today: today ?? this.today,
        serverTime: serverTime,
        rules: rules,
        fetchedAt: fetchedAt,
      );
}

enum ClockKind { clockIn, clockOut }

extension ClockKindX on ClockKind {
  String get apiPath => this == ClockKind.clockIn ? 'clock-in' : 'clock-out';
  String get label => this == ClockKind.clockIn ? 'Clock In' : 'Clock Out';
  String get key => this == ClockKind.clockIn ? 'in' : 'out';
  static ClockKind fromKey(String k) =>
      k == 'out' ? ClockKind.clockOut : ClockKind.clockIn;
}

/// A clock in/out captured while offline, waiting to be sent to the server.
class OfflineItem {
  final String id;
  final int employeeId;
  final ClockKind kind;
  final double latitude;
  final double longitude;
  final double accuracy;
  final bool isMocked;

  /// Device time when the selfie was taken (sent as capturedAt).
  final DateTime capturedAt;
  final String photoPath;
  final String officeName;

  const OfflineItem({
    required this.id,
    required this.employeeId,
    required this.kind,
    required this.latitude,
    required this.longitude,
    required this.accuracy,
    required this.isMocked,
    required this.capturedAt,
    required this.photoPath,
    required this.officeName,
  });

  factory OfflineItem.fromJson(Map<String, dynamic> j) => OfflineItem(
        id: (j['id'] ?? '').toString(),
        employeeId: _toInt(j['employeeId']),
        kind: ClockKindX.fromKey((j['kind'] ?? 'in').toString()),
        latitude: _toDouble(j['latitude']),
        longitude: _toDouble(j['longitude']),
        accuracy: _toDouble(j['accuracy']),
        isMocked: j['isMocked'] == true,
        capturedAt: _toDate(j['capturedAt']) ?? DateTime.now(),
        photoPath: (j['photoPath'] ?? '').toString(),
        officeName: (j['officeName'] ?? '').toString(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'employeeId': employeeId,
        'kind': kind.key,
        'latitude': latitude,
        'longitude': longitude,
        'accuracy': accuracy,
        'isMocked': isMocked,
        'capturedAt': capturedAt.toUtc().toIso8601String(),
        'photoPath': photoPath,
        'officeName': officeName,
      };
}

/// An offline item the server rejected (HTTP 400). Kept so the user can see
/// why it failed; the photo is already deleted.
class FailedItem {
  final String id;
  final ClockKind kind;
  final DateTime capturedAt;
  final String message;
  final DateTime failedAt;

  const FailedItem({
    required this.id,
    required this.kind,
    required this.capturedAt,
    required this.message,
    required this.failedAt,
  });

  factory FailedItem.fromJson(Map<String, dynamic> j) => FailedItem(
        id: (j['id'] ?? '').toString(),
        kind: ClockKindX.fromKey((j['kind'] ?? 'in').toString()),
        capturedAt: _toDate(j['capturedAt']) ?? DateTime.now(),
        message: (j['message'] ?? '').toString(),
        failedAt: _toDate(j['failedAt']) ?? DateTime.now(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'kind': kind.key,
        'capturedAt': capturedAt.toUtc().toIso8601String(),
        'message': message,
        'failedAt': failedAt.toUtc().toIso8601String(),
      };
}
