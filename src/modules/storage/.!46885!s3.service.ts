import * as crypto from 'node:crypto';
import * as path from 'node:path';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { createS3Client, s3Config } from './config/s3.config';
import type { FileUploadResponseDto, PresignedUrlResponseDto } from './dto/upload.dto';
@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = createS3Client();
  }

  async uploadFile(file: Express.Multer.File): Promise<FileUploadResponseDto> {
    try {
      // 验证文件类型
      if (!s3Config.allowedFileTypes.includes(file.mimetype)) {
        throw new BadRequestException(`不支持的文件类型: ${file.mimetype}`);
      }

      // 验证文件大小
      // if (file.size > s3Config.maxFileSize) {
      //   throw new BadRequestException(`文件大小超过限制: ${s3Config.maxFileSize} bytes`);
      // }

