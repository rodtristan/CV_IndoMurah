# Toko CV IndoMurah - Backend API

NestJS + Prisma + Redis + PostgreSQL REST API untuk sistem POS (Point of Sale)

## 📋 Daftar Isi

- [Tech Stack](#-tech-stack)
- [Setup](#-setup)
- [Development](#-development)
- [Arsitektur](#-arsitektur)
- [Generate Module](#-generate-module)
- [API Documentation](#-api-documentation)
- [Database](#-database)
- [Testing](#-testing)
- [Deployment](#-deployment)

## 🛠 Tech Stack

| Teknologi | Keterangan |
|-----------|-------------|
| **NestJS** | Framework Node.js dengan TypeScript |
| **Prisma** | ORM untuk PostgreSQL |
| **Redis** | Caching dan session management |
| **PostgreSQL** | Database |
| **Fastify** | HTTP adapter untuk performa tinggi |
| **Swagger/OpenAPI** | API Documentation |
| **Passport + JWT** | Authentication |

## 🚀 Setup

### Prasyarat

- Node.js v18+
- PostgreSQL 14+
- Redis 6+

### Instalasi

```bash
# 1. Clone repository
git clone <repo-url>
cd api

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi database dan Redis

# 4. Generate Prisma Client
npm run prisma:generate

# 5. Setup database
npm run prisma:migrate
# Atau untuk development cepat:
npm run prisma:push

# 6. Seed database (opsional)
npm run prisma:seed

# 7. Jalankan development server
npm run start:dev
```

### Environment Variables

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=toko_indomurah

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=development
```

## 💻 Development

### Commands

```bash
# Development mode (hot reload)
npm run start:dev

# Build untuk production
npm run build

# Production mode
npm run start:prod

# Lint code
npm run lint

# Format code
npm run format

# TypeScript check
npx tsc --noEmit
```

### Project Structure

```
api/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts             # Database seeder
├── src/
│   ├── common/
│   │   ├── decorators/    # Custom decorators
│   │   ├── dto/            # Shared DTOs
│   │   ├── guards/         # Auth guards
│   │   ├── interceptors/   # Logging, etc
│   │   ├── prisma/        # Prisma service
│   │   ├── query/         # OData query builder
│   │   ├── redis/         # Redis service
│   │   ├── templates/     # Base classes
│   │   └── utils/         # Utilities
│   ├── config/            # Configuration
│   ├── modules/           # Feature modules
│   └── main.ts            # Entry point
├── scripts/
│   └── generate-module.js # Module generator
└── test/
```

## 🏗 Arsitektur

### Module Pattern

Setiap module mengikuti pattern NestJS standar:

```
modules/
└── module-name/
    ├── dto/
    │   └── module-name.dto.ts
    ├── module-name.controller.ts
    ├── module-name.module.ts
    └── module-name.service.ts
```

### Base Classes

Project menggunakan template base classes untuk mengurangi boilerplate:

- **BaseService** - Template service dengan CRUD operations
- **BaseController** - Template controller dengan OData support

### Transaction Support

Semua write operations (POST, PATCH, PUT, DELETE) secara default berjalan dalam transaction block. Untuk disable:

```bash
# Header untuk disable transaction
X-Use-Transaction: false
```

## 🔧 Generate Module

### Cara Penggunaan

```bash
# Generate module baru
node scripts/generate-module.js ModelName

# Contoh
node scripts/generate-module.js Product
node scripts/generate-module.js Supplier
node scripts/generate-module.js Customer
```

### Yang Di-generate

Script akan membuat:

```
modules/<model-name>/
├── dto/
│   └── <model-name>.dto.ts
├── <model-name>.controller.ts
├── <model-name>.module.ts
└── <model-name>.service.ts
```

### Endpoints yang Tersedia

| Method | Endpoint | Deskripsi |
|-------|----------|----------|
| GET | `/api/v1/<model>` | Get all (OData support) |
| GET | `/api/v1/<model>/count` | Get count |
| GET | `/api/v1/<model>/:id` | Get by ID |
| GET | `/api/v1/<model>/by/:field/:value` | Get by field |
| POST | `/api/v1/<model>` | Create |
| POST | `/api/v1/<model>/bulk` | Create bulk |
| PATCH | `/api/v1/<model>/:id` | Update by ID |
| PATCH | `/api/v1/<model>/by/:field/:value` | Update by field |
| PATCH | `/api/v1/<model>/bulk` | Update bulk |
| DELETE | `/api/v1/<model>/:id` | Delete by ID |
| DELETE | `/api/v1/<model>/by/:field/:value` | Delete by field |
| DELETE | `/api/v1/<model>/bulk` | Delete bulk |
| PUT | `/api/v1/<model>` | Upsert |
| PUT | `/api/v1/<model>/by/:field` | Upsert by field |
| PUT | `/api/v1/<model>/bulk` | Upsert bulk |

### OData Query Parameters

| Parameter | Contoh | Deskripsi |
|-----------|--------|-----------|
| `$select` | `$select=id,name,code` | Select fields |
| `$include` | `$include=category,brand` | Include relations |
| `$where` | `$where={"isActive":true}` | Filter |
| `$orderBy` | `$orderBy={"createdAt":"desc"}` | Sort |
| `$skip` | `$skip=0` | Pagination offset |
| `$take` | `$take=20` | Pagination limit (max 100) |
| `$search` | `$search=keyword` | Full-text search |

### Contoh OData Query

```bash
# Get products with category, sorted by name
GET /api/v1/product?$include=category&$orderBy={"name":"asc"}

# Search products with pagination
GET /api/v1/product?$search=laptop&$skip=0&$take=10

# Filter active products
GET /api/v1/product?$where={"isActive":true}
```

### Business Logic di Service

Tambahkan method bisnis logic di service:

```typescript
// modules/product/product.service.ts
async processSale(data: CreateSaleDto, userId: string) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Create sale
    const sale = await tx.sale.create({ data });

    // 2. Update stock
    await tx.productStock.updateMany({
      where: { productId: data.productId },
      data: { quantity: { decrement: data.quantity } }
    });

    // 3. Invalidate cache
    await this.invalidateCache();

    return sale;
  });
}
```

## 📖 API Documentation

### Swagger UI

Setelah server berjalan, buka:

```
http://localhost:3000/api/docs
```

### Authentication

1. Login untuk mendapatkan JWT token:

```bash
POST /api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

2. Gunakan token di header:

```
Authorization: Bearer <your-jwt-token>
```

### Response Format

Semua response mengikuti format standar:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  }
}
```

## 💾 Database

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Apply migrations
npm run prisma:migrate:deploy

# Push schema to database (development)
npm run prisma:push

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run prisma:seed
```

### Schema Definition

Model didefinisikan di `prisma/schema.prisma`:

```prisma
model Product {
  id          Int      @id @default(autoincrement())
  code        String   @unique
  name        String
  price       Decimal  @db.Decimal(15, 2)
  stock       Decimal  @default(0)
  categoryId  Int?
  category    Category? @relation(fields: [categoryId], references: [id])
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")
}
```

### Relations

Prisma auto-generate types untuk relations:

```typescript
// Include relations
const product = await prisma.product.findUnique({
  where: { id: 1 },
  include: { category: true }
});

// Nested includes
const sale = await prisma.sale.findMany({
  include: {
    customer: true,
    items: {
      include: { product: true }
    }
  }
});
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Build

```bash
# Build production
npm run build

# Start production
npm run start:prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_HOST=db
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: toko_indomurah
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 📁 Modules Yang Tersedia

### Master Data
- `category` - Kategori produk
- `brand` - Merek produk
- `unit` - Satuan produk
- `product` - Produk
- `warehouse` - Gudang
- `supplier` - Supplier
- `customer` - Pelanggan
- `sales-person` - Sales person
- `sale-point` - Poin penjualan

### Transaksi
- `sale` - Penjualan
- `sale-order` - Order penjualan
- `sale-payment` - Pembayaran penjualan
- `sale-return` - Retur penjualan
- `purchase` - Pembelian
- `purchase-order` - Order pembelian
- `purchase-payment` - Pembayaran pembelian
- `purchase-return` - Retur pembelian

### Inventory
- `stock-in` - Barang masuk
- `stock-out` - Barang keluar
- `stock-transfer` - Transfer stock
- `stock-opname` - Stock opname

### Accounting
- `account` - Chart of accounts
- `cash-in` - Kas masuk
- `cash-out` - Kas keluar
- `cash-transfer` - Transfer kas
- `customer-deposit` - Deposito pelanggan
- `supplier-deposit` - Deposito supplier
- `journal` - Jurnal umum
- `journal-entry` - Entry jurnal

### Settings
- `point-setting` - Pengaturan poin
- `point-redemption` - Penukaran poin
- `company` - Informasi perusahaan
- `numbering` - Format penomoran

### Lainnya
- `auth` - Authentication
- `user` - User management
- `role` - Role management
- `menu` - Menu management
- `report` - Laporan
- `dashboard` - Dashboard

## 🔒 Security

### Guards

- **JwtAuthGuard** - Memvalidasi JWT token
- **ThrottlerGuard** - Rate limiting

### Headers

```bash
# Disable transaction (untuk bulk operations)
X-Use-Transaction: false
```

## 📝 License

Private - All rights reserved
