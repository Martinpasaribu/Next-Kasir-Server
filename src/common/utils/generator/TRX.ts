/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/modules/products/utils/sku-generator.util.ts

export async function generateTRX(
  transactionModel: any, 
  categoryName: string = 'TRX'
): Promise<string> {
  // 1. Ambil inisial kategori (3 huruf pertama)
  const prefix = categoryName.substring(0, 3).toUpperCase().padEnd(3, 'X');

  // 2. Ambil total dokumen untuk counter
  // Kita gunakan countDocuments untuk mendapatkan angka urutan
  const count = await transactionModel.countDocuments();
  const sequence = (count + 1).toString().padStart(4, '0');

  // 3. Ambil Tahun & Bulan (YYMM)
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 26
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 02

  // Hasil Format: MAK-2602-0001
  return `${prefix}-${year}${month}${sequence}`;
}