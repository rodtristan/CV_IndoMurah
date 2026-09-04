import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../models/category_model.dart';
import '../../models/product_model.dart';
import '../../widgets/category_chip.dart';
import '../../widgets/product_card.dart';
import '../catalog/product_detail_screen.dart';

/// Beranda: banner promo, kategori, produk unggulan.
/// Data masih dummy — ganti dengan hasil `ApiService.get(ApiEndpoints.products)`
/// dan `ApiEndpoints.categories` setelah backend siap.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  static final _dummyCategories = [
    CategoryModel(id: '1', name: 'Sembako'),
    CategoryModel(id: '2', name: 'Kebutuhan Rumah'),
    CategoryModel(id: '3', name: 'Elektronik'),
    CategoryModel(id: '4', name: 'ATK'),
  ];

  static final _dummyProducts = List.generate(
    6,
    (i) => ProductModel(
      id: '$i',
      name: 'Produk Unggulan ${i + 1}',
      price: 50000 + (i * 15000),
      discountPrice: i.isEven ? 40000 + (i * 15000) : null,
      stock: 10,
    ),
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              floating: true,
              backgroundColor: AppColors.background,
              title: const Text(AppStrings.appName, style: TextStyle(fontWeight: FontWeight.bold)),
              actions: [
                IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () {}),
              ],
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Container(
                  height: 140,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppColors.primary, AppColors.primaryDark]),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.all(20),
                  alignment: Alignment.centerLeft,
                  child: const Text(
                    'Promo Spesial\nDiskon hingga 30%',
                    style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 48,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _dummyCategories.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) => CategoryChip(category: _dummyCategories[i], onTap: () {}),
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverToBoxAdapter(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Produk Unggulan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    TextButton(onPressed: () {}, child: const Text(AppStrings.seeAll)),
                  ],
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.62,
                ),
                delegate: SliverChildBuilderDelegate(
                  (_, i) => ProductCard(
                    product: _dummyProducts[i],
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => ProductDetailScreen(product: _dummyProducts[i])),
                    ),
                  ),
                  childCount: _dummyProducts.length,
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }
}
