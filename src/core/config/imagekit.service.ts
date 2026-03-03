/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import ImageKit from 'imagekit';
import { UploadResponse } from 'imagekit/dist/libs/interfaces';

@Injectable()
export class ImageKitService {
  private imagekitInstance: ImageKit | null = null;
  private readonly logger = new Logger(ImageKitService.name);

  // Jangan inisialisasi di constructor untuk lingkungan Serverless
  constructor() {}

  /**
   * Mengambil instance ImageKit. 
   * Jika belum ada, baru dibuat menggunakan env terbaru.
   */
  private get imagekit(): ImageKit {
    if (!this.imagekitInstance) {
      const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
      const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

      if (!publicKey || !privateKey || !urlEndpoint) {
        this.logger.error('❌ Kredensial ImageKit tidak ditemukan di Environment Variables!');
        throw new InternalServerErrorException('Konfigurasi Cloud Storage tidak valid');
      }

      this.imagekitInstance = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint,
      });
    }
    return this.imagekitInstance;
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadResponse> {
    try {
      // Menggunakan getter 'this.imagekit' agar inisialisasi terjadi di sini
      const response = await this.imagekit.upload({
        file: file.buffer,
        fileName: `${Date.now()}-${file.originalname.replace(/\s/g, '-')}`,
        folder: '/quiz-app-assets',
        useUniqueFileName: true,
      });

      return response;
    } catch (error: any) {
      this.logger.error(`ImageKit Upload Error: ${error.message}`);
      throw new InternalServerErrorException('Gagal mengunggah file ke cloud storage');
    }
  }

  async deleteImage(fileId: string): Promise<boolean> {
    try {
      await this.imagekit.deleteFile(fileId);
      return true;
    } catch (error) {
      this.logger.error('ImageKit Delete Error:', error);
      return false; 
    }
  }
}