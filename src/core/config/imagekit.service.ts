/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';

// Karena import dari 'dist/libs/interfaces' sering bermasalah di TS, 
// kita buat interface manual yang sesuai dengan dokumentasi ImageKit.
interface ImageKitResponse {
  fileId: string;
  name: string;
  size: number;
  versionInfo: { id: string; name: string };
  filePath: string;
  url: string;
  fileType: string;
  thumbnailUrl: string;
  height: number;
  width: number;
}

@Injectable()
export class ImageKitService {
  private imagekit: ImageKit;
  private readonly logger = new Logger(ImageKitService.name);

  constructor(private configService: ConfigService) {
    const publicKey = this.configService.get<string>('IMAGEKIT_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('IMAGEKIT_PRIVATE_KEY');
    const urlEndpoint = this.configService.get<string>('IMAGEKIT_URL_ENDPOINT');

    // Cek ketersediaan variabel sebelum inisialisasi
    if (!publicKey || !privateKey || !urlEndpoint) {
      this.logger.error('❌ ImageKit Config is missing! Check Vercel Env Variables.');
      throw new Error('ImageKit initialization failed: Missing credentials');
    }

    this.imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  }

  /**
   * Mengunggah file ke ImageKit
   */
  async uploadImage(file: Express.Multer.File): Promise<ImageKitResponse> {
    try {
      // Pastikan file.buffer ada (didapat dari FileInterceptor)
      if (!file.buffer) {
        throw new Error('File buffer is empty');
      }

      const response = await this.imagekit.upload({
        file: file.buffer, // Mengirim buffer langsung
        fileName: `${Date.now()}-${file.originalname}`,
        folder: '/nextkasir/',
        useUniqueFileName: true,
      });

      return response as unknown as ImageKitResponse;
    } catch (error) {
      console.error('ImageKit Upload Error:', error);
      throw new InternalServerErrorException('Gagal mengunggah file ke cloud storage');
    }
  }

  /**
   * Menghapus file dari ImageKit
   */
  async deleteImage(fileId: string): Promise<boolean> {
    try {
      await this.imagekit.deleteFile(fileId);
      return true;
    } catch (error) {
      console.error('ImageKit Delete Error:', error);
      return false; 
    }
  }
}