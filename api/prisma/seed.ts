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

  console.log('Seed selesai:');
  console.log(`  Admin : ${adminEmail} / admin123 (GANTI password ini setelah login pertama!)`);
  console.log(`  id    : ${admin.id}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
