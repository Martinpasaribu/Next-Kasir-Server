/* eslint-disable max-len */
// src/common/utils/string.util.ts

export interface TenantIdResult {
  id: string;
  suffix: string;
}

export const generateSafeTenantId = (name: string): TenantIdResult => {
  if (!name || name.trim().length === 0) {
    throw new Error('Nama bisnis wajib diisi');
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/[^a-z0-9]/g, '');

  if (slug.length < 3) {
    throw new Error('Nama bisnis terlalu pendek (minimal 3 karakter)');
  }

  const reservedKeywords = ['admin', 'master', 'system', 'config', 'root', 'local'];
  if (reservedKeywords.includes(slug)) {
    throw new Error(`Nama "${slug}" dilarang oleh sistem`);
  }

  // --- GENERATE SUFFIX (3 Angka & 2 Huruf) ---
  const numbers = '0123456789';
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let tempSuffix = '';
  
  for (let i = 0; i < 3; i++) {
    tempSuffix += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  for (let i = 0; i < 2; i++) {
    tempSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const suffix = tempSuffix.split('').sort(() => Math.random() - 0.5).join('');

  let finalSlug = slug;
  const prefix = 'tenant_';
  const totalLength = prefix.length + finalSlug.length + 1 + suffix.length; // +1 untuk underscore sebelum suffix

  if (totalLength > 64) {
    finalSlug = slug.substring(0, 40);
  }

  return {
    id: `tenant_${finalSlug}_${suffix}`,
    suffix: suffix
  };
};