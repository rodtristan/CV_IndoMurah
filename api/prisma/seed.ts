import 'dotenv/config';
import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // ─── Company default ─────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { companyCode: 'INDOMURAH' },
    create: {
      companyCode: 'INDOMURAH',
      name: 'CV Indo Murah',
      address: 'Jl. Raya Utama No. 1',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      isActive: true,
    },
    update: { isActive: true },
  });

  // ─── Role default (id = 1) ─────────────────────────────────
  // RegisterDto.roleId defaults to 1 (see auth-service.ts) — pastikan role
  // ini ada agar register() tidak gagal karena FK constraint.
  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    create: { roleName: 'Administrator', roleDescription: 'Akses penuh ke seluruh sistem' },
    update: {},
  });

  // ─── User admin default ────────────────────────────────────
  // User model: companyId + username (login flow), plus flat email/role
  // untuk kompatibilitas endpoint lama — lihat auth-service.ts.
  const adminUsername = 'admin';
  const adminEmail = 'admin@tokocvindomurah.com';
  const adminPassword = await argon2.hash('admin123', { type: argon2.argon2id });

  const admin = await prisma.user.upsert({
    where: {
      companyId_username: {
        companyId: company.id,
        username: adminUsername,
      },
    },
    create: {
      companyId: company.id,
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      name: 'Administrator',
      role: 'admin',
      isActive: true,
    },
    update: { isActive: true },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    create: { userId: admin.id, roleId: adminRole.id, isActive: true },
    update: { isActive: true },
  });

  // ─── Pelanggan Umum (walk-in) ───────────────────────────────
  // POS kasir (web/src/app/(pos)/sale/pos/page.tsx) fallback ke customerId
  // ini ketika kasir tidak memilih pelanggan — customerId wajib diisi di
  // CreateSaleDto. Upsert by code supaya id-nya stabil lintas re-seed.
  const walkInCustomer = await prisma.customer.upsert({
    where: { code: 'UMUM' },
    create: { code: 'UMUM', name: 'Pelanggan Umum', isActive: true },
    update: {},
  });

  // ─── Menus dasar + akses role Admin ─────────────────────────
  const menuNames = ['dashboard', 'users', 'roles', 'menus'];
  const menus = await Promise.all(
    menuNames.map((name) =>
      prisma.menu.upsert({
        where: { id: menuNames.indexOf(name) + 1 },
        create: { id: menuNames.indexOf(name) + 1, menuName: name, menuType: 'sidebar' },
        update: {},
      }),
    ),
  );

  await Promise.all(
    menus.map((menu) =>
      prisma.roleMenu.upsert({
        where: { roleId_menuId: { roleId: adminRole.id, menuId: menu.id } },
        create: { roleId: adminRole.id, menuId: menu.id },
        update: { isActive: true },
      }),
    ),
  );

  // Seed menu akses personal admin (UserMenu) dari RoleMenu-nya
  await Promise.all(
    menus.map((menu) =>
      prisma.userMenu.upsert({
        where: { userId_menuId: { userId: admin.id, menuId: menu.id } },
        create: { userId: admin.id, menuId: menu.id },
        update: { isActive: true },
      }),
    ),
  );

  console.log('Seed selesai:');
  console.log(`  Company: ${company.companyCode} (id=${company.id})`);
  console.log(`  Role   : ${adminRole.roleName} (id=${adminRole.id})`);
  console.log(`  Menus  : ${menus.map((m) => m.menuName).join(', ')}`);
  console.log(`  Customer walk-in: ${walkInCustomer.code} (id=${walkInCustomer.id})`);
  console.log(`  Admin  : ${company.companyCode} / ${adminUsername} / admin123 (GANTI password ini setelah login pertama!)`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
