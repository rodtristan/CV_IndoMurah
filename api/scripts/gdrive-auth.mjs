// Sekali jalan: dapatkan GDRIVE_REFRESH_TOKEN dan tulis ke api/.env.
//   cd api && node scripts/gdrive-auth.mjs
// Butuh GDRIVE_CLIENT_ID dan GDRIVE_CLIENT_SECRET di .env. Redirect URI memakai
// OAuth Playground karena hanya itu yang terdaftar di OAuth client.
import { readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { resolve } from 'node:path';

function fail() {
  process.exitCode = 1;
}

async function main() {
  const ENV = resolve(process.cwd(), '.env');
  const REDIRECT = 'https://developers.google.com/oauthplayground';
  const SCOPE = 'https://www.googleapis.com/auth/drive';

  const envText = readFileSync(ENV, 'utf8');
  const get = (k) => (envText.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1] ?? '').trim().replace(/^"|"$/g, '');
  const clientId = get('GDRIVE_CLIENT_ID');
  const clientSecret = get('GDRIVE_CLIENT_SECRET');
  const folderId = get('GDRIVE_FOLDER_ID');
  if (!clientId || !clientSecret) {
    console.error('GDRIVE_CLIENT_ID / GDRIVE_CLIENT_SECRET belum diisi di .env');
    return fail();
  }

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  }).toString();

  console.log('\n1) Buka link ini, login dengan akun Google PEMILIK folder, lalu klik Izinkan/Allow:\n');
  console.log(url.toString());
  console.log('\n2) Browser akan pindah ke halaman OAuth Playground. Salin SELURUH alamat (URL) dari address bar');
  console.log('   (berisi "?code=..."), atau hanya nilai code-nya, lalu tempel di bawah.\n');

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const pasted = (await rl.question('Tempel URL / code: ')).trim();
  rl.close();

  let code = pasted;
  try {
    code = new URL(pasted).searchParams.get('code') ?? pasted;
  } catch {
    /* bukan URL, anggap sudah berupa code */
  }
  code = decodeURIComponent(code);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: REDIRECT, grant_type: 'authorization_code' }),
  });
  const tok = await res.json();
  if (!res.ok || !tok.refresh_token) {
    console.error('\nGagal menukar code:', tok.error, tok.error_description ?? '');
    console.error('Code hanya berlaku sekali dan beberapa menit. Jalankan ulang skrip dan ulangi dari langkah 1.');
    return fail();
  }

  if (folderId) {
    const f = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=name,capabilities(canAddChildren)&supportsAllDrives=true`, {
      headers: { Authorization: `Bearer ${tok.access_token}` },
    });
    const meta = await f.json();
    if (!f.ok) {
      console.error(`\nToken didapat, tetapi akun ini tidak bisa membuka folder ${folderId}:`, meta.error?.message);
      console.error('Login dengan akun pemilik folder, atau bagikan folder ke akun ini sebagai Editor, lalu ulangi.');
      return fail();
    }
    if (!meta.capabilities?.canAddChildren) {
      console.error(`\nAkun ini hanya bisa melihat folder "${meta.name}", tidak bisa menambah file. Beri akses Editor lalu ulangi.`);
      return fail();
    }
    console.log(`\nAkses folder "${meta.name}" OK (bisa upload).`);
  }

  const line = `GDRIVE_REFRESH_TOKEN=${tok.refresh_token}`;
  const next = /^GDRIVE_REFRESH_TOKEN=.*$/m.test(envText)
    ? envText.replace(/^GDRIVE_REFRESH_TOKEN=.*$/m, line)
    : `${envText.replace(/\s*$/, '')}\n${line}\n`;
  writeFileSync(ENV, next);
  console.log('GDRIVE_REFRESH_TOKEN tersimpan di api/.env. Restart API agar dipakai.\n');
}

await main();
