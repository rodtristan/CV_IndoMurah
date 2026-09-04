// ================================================================
// api-response-dto.ts — Format Response Standar API
// ================================================================
//
// SEMUA response dari API menggunakan format yang konsisten:
//
//   Sukses:
//   {
//     "success": true,
//     "message": "Berhasil",
//     "data": { ... }
//   }
//
//   Error:
//   {
//     "success": false,
//     "message": "Pesan error"
//   }
//
//   List dengan paginasi:
//   {
//     "success": true,
//     "data": [...],
//     "meta": {
//       "total": 100,
//       "skip": 0,
//       "take": 10,
//       "pages": 10,
//       "hasNext": true,
//       "hasPrev": false
//     }
//   }
// ================================================================

// Tipe generik T memungkinkan data bisa tipe apa saja
// Contoh: ApiResponse<Product>, ApiResponse<Product[]>, ApiResponse<{ token: string }>
export class ApiResponse<T = any> {
  success: boolean;  // true = sukses, false = error
  message?: string;  // Pesan human-readable
  data?: T;          // Data yang dikembalikan
  meta?: PaginationMeta;  // Info paginasi (untuk daftar)

  // ── Static method untuk response sukses ────────────────────────────
  static ok<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  // ── Static method untuk response list dengan paginasi ──────────────
  static paginated<T>(
    data: T[],    // Array data
    total: number, // Total semua data (bukan hanya yang di halaman ini)
    skip: number,  // Offset (data ke berapa yang mulai diambil)
    take: number,  // Jumlah data per halaman
    message?: string,
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      message,
      meta: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),          // Total halaman
        hasNext: skip + take < total,             // Ada halaman berikutnya?
        hasPrev: skip > 0,                        // Ada halaman sebelumnya?
      },
    };
  }

  // ── Static method untuk response error ─────────────────────────────
  static error(message: string): ApiResponse {
    return {
      success: false,
      message,
    };
  }
}

// ── Meta paginasi ─────────────────────────────────────────────────────────
export class PaginationMeta {
  total: number;    // Total semua data di database
  skip: number;     // Offset saat ini
  take: number;     // Data per halaman saat ini
  pages: number;    // Total halaman
  hasNext: boolean; // Ada halaman berikutnya?
  hasPrev: boolean; // Ada halaman sebelumnya?
}
