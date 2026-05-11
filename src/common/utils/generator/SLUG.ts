/* eslint-disable no-useless-escape */
// src/common/utils/string.util.ts

/**
 * Mengubah string menjadi format slug URL-friendly
 * Contoh: "Kopi Susu Gula Aren!!" -> "kopi-susu-gula-aren"
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Ganti spasi dengan -
    .replace(/[^\w\-]+/g, '')       // Hapus semua karakter non-word (kecuali -)
    .replace(/\-\-+/g, '-')         // Ganti multiple - dengan single -
    .replace(/^-+/, '')             // Hapus - di awal teks
    .replace(/-+$/, '');            // Hapus - di akhir teks
};

/**
 * Menambahkan suffix random untuk menghindari duplikat slug
 */
export const generateUniqueSlug = (text: string): string => {
  const slug = slugify(text);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${slug}-${randomStr}`;
};