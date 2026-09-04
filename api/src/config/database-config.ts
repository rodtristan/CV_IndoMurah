import { registerAs } from '@nestjs/config';

function buildDatabaseUrl(): string {
  const env = process.env.NODE_ENV || 'development';

  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (env === 'production') {
    return `postgresql://${process.env.DB_PRD_USER}:${process.env.DB_PRD_PASS}@${process.env.DB_PRD_HOST}:${process.env.DB_PRD_PORT}/${process.env.DB_PRD}?schema=public`;
  }

  if (env === 'testing') {
    return `postgresql://${process.env.DB_TEST_USER}:${process.env.DB_TEST_PASS}@${process.env.DB_TEST_HOST}:${process.env.DB_TEST_PORT}/${process.env.DB_TEST}?schema=public`;
  }

  // default: development
  return `postgresql://${process.env.DB_DEV_USER}:${process.env.DB_DEV_PASS}@${process.env.DB_DEV_HOST}:${process.env.DB_DEV_PORT}/${process.env.DB_DEV}?schema=public`;
}

export default registerAs('database', () => ({
  url: buildDatabaseUrl(),
  dev: {
    host: process.env.DB_DEV_HOST || 'localhost',
    port: parseInt(process.env.DB_DEV_PORT || '5432', 10),
    user: process.env.DB_DEV_USER || 'postgres',
    pass: process.env.DB_DEV_PASS || 'yourpassword',
    name: process.env.DB_DEV || 'toko_cv_indomurah_dev',
  },
  prd: {
    host: process.env.DB_PRD_HOST || 'localhost',
    port: parseInt(process.env.DB_PRD_PORT || '5432', 10),
    user: process.env.DB_PRD_USER || 'postgres',
    pass: process.env.DB_PRD_PASS || 'yourpassword',
    name: process.env.DB_PRD || 'toko_cv_indomurah_prod',
  },
  test: {
    host: process.env.DB_TEST_HOST || 'localhost',
    port: parseInt(process.env.DB_TEST_PORT || '5432', 10),
    user: process.env.DB_TEST_USER || 'postgres',
    pass: process.env.DB_TEST_PASS || 'yourpassword',
    name: process.env.DB_TEST || 'toko_cv_indomurah_test',
  },
}));
