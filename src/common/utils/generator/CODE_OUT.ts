/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/modules/products/utils/sku-generator.util.ts

export async function generateOutletCode(
  outletModel: any, 
  categoryName: string = 'TKO'
): Promise<string> {
  
  /**
   * 1. SANITASI PREFIX
   * - Hapus semua karakter non-alfanumerik (termasuk underscore, spasi, simbol)
   * - Contoh: "Kopi_Susu" -> "KOPIS"
   * - Contoh: "Bakery & Cake" -> "BAKER"
   */
  const cleanPrefix = categoryName
    .replace(/[^a-zA-Z0-9]/g, '') // Hapus selain huruf & angka
    .substring(0, 3)             // Ambil maksimal 5 huruf
    .toUpperCase()               // Ubah ke Capital
    .padEnd(3, 'X');             // Jika kurang dari 3 huruf, tambahkan 'X' (Misal: 'A' -> 'AXX')

  // 2. Ambil total dokumen untuk counter (Urutan ke berapa outlet ini)
  const count = await outletModel.countDocuments();
  const sequence = (count + 1).toString().padStart(3, '0'); // Contoh: 001, 002

  // 3. Ambil Tahun & Bulan (YYMM)
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 26
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 04 (April)
  const day = now.getDate().toString().padStart(2, '0'); // 04 (April)

  /**
   * HASIL FORMAT: [PREFIX]-[YYMM]-[SEQ]
   * Contoh input "Kopi_Susu" di bulan April 2026:
   * Hasil: KOPIS-2604-001
   */
  return `${cleanPrefix}${day}${sequence}`;
}