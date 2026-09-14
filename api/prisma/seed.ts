import 'dotenv/config';
import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // ─── User admin default ────────────────────────────────────
  // User model saat ini flat (id uuid, email, password, name, role: string) —
  // lihat catatan di src/modules/auth/auth-service.ts.
  const adminEmail = 'admin@tokocvindomurah.com';
  const adminPassword = await argon2.hash('admin123', { type: argon2.argon2id });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      password: adminPassword,
      name: 'Administrator',
      role: 'admin',
      isActive: true,
    },
    update: {},
  });

  // ─── Role default (id = 1) ─────────────────────────────────
  // RegisterDto.roleId defaults to 1 (see auth-service.ts) — pastikan role
  // ini ada agar register() tidak gagal karena FK constraint.
  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    create: { roleName: 'Administrator', roleDescription: 'Akses penuh ke semua modul' },
    update: {},
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    create: { userId: admin.id, roleId: adminRole.id, isActive: true },
    update: { isActive: true },
  });

  console.log('Seed selesai:');
  console.log(`  Admin : ${adminEmail} / admin123 (GANTI password ini setelah login pertama!)`);
  console.log(`  id    : ${admin.id}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
