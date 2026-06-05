/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// server-nextkasir\src\common\filters\mongo-exception.filter.ts

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { MongoServerError } from 'mongodb';
import { Error } from 'mongoose'; // Import Error dari mongoose

@Catch() // Kosongkan agar bisa menangkap berbagai jenis error atau spesifikkan
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 1. Tangani Duplicate Key Error (MongoDB)
    if (exception instanceof MongoServerError && exception.code === 11000) {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        status: false,
        message: 'Data sudah ada (Duplicate Key Error)',
        error: 'Conflict',
        detail: exception.keyValue
      });
    }

    // 2. Tangani Validation Error (Mongoose)
  // 2. Tangani Validation Error (Mongoose)
  // Kita cek lewat string name-nya karena instanceof sering meleset di NestJS
  if (exception.name === 'ValidationError' && exception.errors) {
    // Mengambil detail pesan error dan field-nya
    const errorsDetail = Object.keys(exception.errors).map((key) => {
      return {
        field: key, // Menampilkan field mana yang error (contoh: "recipe_id")
        message: exception.errors[key].message // Pesan errornya (contoh: "Path `recipe_id` is required.")
      };
    });

    return response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      status: false,
      message: 'Validasi input Gagal',
      errors: errorsDetail, // Sekarang isinya berupa array of object yang detail
    });
  }
    // 3. Fallback untuk Error lainnya
  // 3. Fallback untuk Error lainnya (Termasuk BadRequestException dari NestJS)
  const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

  // Ambil response bawaan NestJS jika ada
  const exceptionResponse = exception.getResponse ? exception.getResponse() : null;

  let errorMessage = exception.message || 'Internal Server Error';
  let errorDetails = undefined;

  // Jika error berasal dari ValidationPipe NestJS, bongkar isinya
  if (exceptionResponse && typeof exceptionResponse === 'object') {
    errorMessage = (exceptionResponse as any).message || errorMessage;
    errorDetails = (exceptionResponse as any).error || undefined;
  }

  return response.status(status).json({
    statusCode: status,
    status: false,
    message: typeof errorMessage === 'string' ? errorMessage : 'Validasi Input Gagal',
    errors: Array.isArray(errorMessage) ? errorMessage : undefined, // Tempat list error class-validator berada
    error: errorDetails
  });
    }
}