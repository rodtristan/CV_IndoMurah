class CategoryModel {
  final String id;
  final String name;
  final String? imageUrl;

  CategoryModel({required this.id, required this.name, this.imageUrl});

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'].toString(),
      name: json['name'] as String,
      imageUrl: json['image_url'] as String?,
    );
  }
}
