import 'dotenv/config';
import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // ─── Role: Admin ────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    create: { id: 1, role_name: 'Admin', role_description: 'Akses penuh ke seluruh sistem' },
    update: {},
  });

  // ─── Menus dasar ────────────────────────────────────────────
  const menuNames = ['dashboard', 'users', 'roles', 'menus'];
  const menus = await Promise.all(
    menuNames.map((name) =>
      prisma.menu.upsert({
        where: { id: menuNames.indexOf(name) + 1 },
        create: { id: menuNames.indexOf(name) + 1, menu_name: name, menu_type: 'sidebar' },
        update: {},
      }),
    ),
  );

  // ─── Admin dapat akses semua menu di atas ──────────────────
  await Promise.all(
    menus.map((menu) =>
      prisma.roleMenu.upsert({
        where: { role_id_menu_id: { role_id: adminRole.id, menu_id: menu.id } },
        create: { role_id: adminRole.id, menu_id: menu.id },
        update: { is_active: true },
      }),
    ),
  );

  // ─── User admin default ────────────────────────────────────
  const adminEmail = 'admin@tokocvindomurah.com';
  const adminPassword = await argon2.hash('admin123', { type: argon2.argon2id });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      password: adminPassword,
      full_name: 'Administrator',
      main_role_id: adminRole.id,
      is_active: true,
    },
    update: {},
  });

  // Seed menu akses personal admin (UserMenu) dari RoleMenu-nya
  await Promise.all(
    menus.map((menu) =>
      prisma.userMenu.upsert({
        where: { user_id_menu_id: { user_id: admin.id, menu_id: menu.id } },
        create: { user_id: admin.id, menu_id: menu.id },
        update: { is_active: true },
      }),
    ),
  );

  console.log('Seed selesai:');
  console.log(`  Role  : ${adminRole.role_name} (id=${adminRole.id})`);
  console.log(`  Menus : ${menus.map((m) => m.menu_name).join(', ')}`);
  console.log(`  Admin : ${adminEmail} / admin123 (GANTI password ini setelah login pertama!)`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
