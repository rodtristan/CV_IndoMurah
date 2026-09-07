/// Status of a payroll record for a given period.
enum PayrollStatus {
  paid,
  pending;

  static PayrollStatus fromString(String? value) {
    switch (value) {
      case 'paid':
      case 'PAID':
        return PayrollStatus.paid;
      default:
        return PayrollStatus.pending;
    }
  }
}

/// Represents one month's payroll/payslip record for an employee.
///
/// NOTE: There is no `Payroll` module in the backend yet — screens using
/// this model currently render dummy data (see `PayrollScreen`). Swap in
/// a real `ApiService.get(...)` call here once that endpoint exists.
class PayrollModel {
  final String id;
  final DateTime periodMonth;
  final double baseSalary;
  final double allowance;
  final double deduction;
  final PayrollStatus status;
  final DateTime? paidAt;

  const PayrollModel({
    required this.id,
    required this.periodMonth,
    required this.baseSalary,
    required this.allowance,
    required this.deduction,
    this.status = PayrollStatus.pending,
    this.paidAt,
  });

  double get netSalary => baseSalary + allowance - deduction;

  factory PayrollModel.fromJson(Map<String, dynamic> json) {
    return PayrollModel(
      id: json['id']?.toString() ?? '',
      periodMonth: DateTime.tryParse(json['periodMonth']?.toString() ?? '') ?? DateTime.now(),
      baseSalary: (json['baseSalary'] as num?)?.toDouble() ?? 0,
      allowance: (json['allowance'] as num?)?.toDouble() ?? 0,
      deduction: (json['deduction'] as num?)?.toDouble() ?? 0,
      status: PayrollStatus.fromString(json['status']?.toString()),
      paidAt: json['paidAt'] != null ? DateTime.tryParse(json['paidAt'].toString()) : null,
    );
  }
}
