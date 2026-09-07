// ================================================================
// menu-key-decorator.ts — Deklarasi Kunci Menu untuk Guard
// ================================================================
//
// Dipakai di controller untuk menandai bahwa sebuah endpoint
// memerlukan akses ke menu tertentu. MenuAccessGuard membaca nilai
// ini lalu mengecek apakah user/role yang request punya akses.
//
// Cara pakai:
//   @UseGuards(JwtAuthGuard, MenuAccessGuard)
//   @MenuKey('users.view')
//   @Get()
//   findAll() { ... }
//
// Konvensi penamaan menu key: '[modul].[aksi]' → 'users.view', 'users.create'
// ================================================================

import { SetMetadata } from '@nestjs/common';

export const MENU_KEY_METADATA = 'menu_key';

/**
 * Tandai endpoint dengan nama menu yang dibutuhkan.
 * @param key - nama menu (contoh: 'users.view', 'products.export')
 */
export const MenuKey = (key: string) => SetMetadata(MENU_KEY_METADATA, key);
