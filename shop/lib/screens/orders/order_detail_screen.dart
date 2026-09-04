import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/constants/app_colors.dart';
import '../../models/order_model.dart';

final _currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
final _dateFormat = DateFormat('dd MMM yyyy, HH:mm', 'id_ID');

class OrderDetailScreen extends StatelessWidget {
  final OrderModel order;
  const OrderDetailScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Pesanan #${order.id}')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(_dateFormat.format(order.createdAt), style: const TextStyle(color: AppColors.textSecondary)),
          const SizedBox(height: 16),
          if (order.items.isEmpty)
            const Text('Detail item pesanan belum tersedia (data dummy).', style: TextStyle(color: AppColors.textSecondary))
          else
            ...order.items.map(
              (item) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(child: Text('${item.productName} x${item.quantity}')),
                    Text(_currencyFormat.format(item.price * item.quantity)),
                  ],
                ),
              ),
            ),
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              Text(
                _currencyFormat.format(order.total),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primary),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
