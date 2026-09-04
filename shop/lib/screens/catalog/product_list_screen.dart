import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../models/product_model.dart';
import '../../widgets/product_card.dart';
import 'product_detail_screen.dart';

/// Katalog produk dengan search bar. Data masih dummy — ganti dengan
/// `ApiService.get(ApiEndpoints.products)` setelah backend siap.
class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final _searchController = TextEditingController();

  static final _dummyProducts = List.generate(
    12,
    (i) => ProductModel(
      id: '$i',
      name: 'Produk Katalog ${i + 1}',
      price: 25000 + (i * 8000),
      discountPrice: i % 3 == 0 ? 20000 + (i * 8000) : null,
      stock: i % 5 == 0 ? 0 : 10,
    ),
  );

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(AppStrings.catalog),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: AppStrings.search,
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: AppColors.surface,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
              ),
            ),
          ),
        ),
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 0.62,
        ),
        itemCount: _dummyProducts.length,
        itemBuilder: (_, i) => ProductCard(
          product: _dummyProducts[i],
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => ProductDetailScreen(product: _dummyProducts[i])),
          ),
        ),
      ),
    );
  }
}
