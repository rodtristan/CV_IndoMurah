import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../models/payroll_model.dart';

final _currency = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

/// Lists the employee's monthly payroll/payslip records.
///
/// TODO: Replace `_dummyPayrolls` with `ApiService.get(...)` once a
/// Payroll module exists in the backend (see `payroll_model.dart`).
class PayrollScreen extends StatelessWidget {
  const PayrollScreen({super.key});

  List<PayrollModel> get _dummyPayrolls {
    final now = DateTime.now();
    return List.generate(6, (index) {
      final period = DateTime(now.year, now.month - index, 1);
      final isCurrentMonth = index == 0;
      return PayrollModel(
        id: 'dummy-payroll-$index',
        periodMonth: period,
        baseSalary: 4500000,
        allowance: 500000 + (index % 2 == 0 ? 250000 : 0),
        deduction: 150000,
        status: isCurrentMonth ? PayrollStatus.pending : PayrollStatus.paid,
        paidAt: isCurrentMonth ? null : DateTime(period.year, period.month + 1, 5),
      );
    });
  }

  void _showDetail(BuildContext context, PayrollModel payroll) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _PayrollDetailSheet(payroll: payroll),
    );
  }

  @override
  Widget build(BuildContext context) {
    final payrolls = _dummyPayrolls;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(AppStrings.payrollTitle),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          itemCount: payrolls.length,
          itemBuilder: (context, index) {
            final payroll = payrolls[index];
            final isPaid = payroll.status == PayrollStatus.paid;

            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              elevation: 1,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                onTap: () => _showDetail(context, payroll),
                contentPadding: const EdgeInsets.all(14),
                title: Text(
                  DateFormat('MMMM y', 'id_ID').format(payroll.periodMonth),
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                subtitle: Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: (isPaid ? AppColors.success : AppColors.warning).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      isPaid ? AppStrings.payrollPaid : AppStrings.payrollPending,
                      style: TextStyle(
                        color: isPaid ? AppColors.success : AppColors.warning,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                trailing: Text(
                  _currency.format(payroll.netSalary),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _PayrollDetailSheet extends StatelessWidget {
  final PayrollModel payroll;

  const _PayrollDetailSheet({required this.payroll});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              DateFormat('MMMM y', 'id_ID').format(payroll.periodMonth),
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            _DetailRow(label: AppStrings.baseSalary, value: _currency.format(payroll.baseSalary)),
            _DetailRow(label: AppStrings.allowance, value: '+ ${_currency.format(payroll.allowance)}'),
            _DetailRow(
              label: AppStrings.deduction,
              value: '- ${_currency.format(payroll.deduction)}',
              valueColor: AppColors.error,
            ),
            const Divider(height: 24),
            _DetailRow(
              label: AppStrings.netSalary,
              value: _currency.format(payroll.netSalary),
              bold: true,
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;
  final Color? valueColor;

  const _DetailRow({
    required this.label,
    required this.value,
    this.bold = false,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary)),
          Text(
            value,
            style: TextStyle(
              fontWeight: bold ? FontWeight.bold : FontWeight.w600,
              fontSize: bold ? 16 : 14,
              color: valueColor,
            ),
          ),
        ],
      ),
    );
  }
}
