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

      // 生成唯一文件�?      const fileExtension = path.extname(file.originalname);
      const fileName = `${crypto.randomUUID()}${fileExtension}`;
      const key = `${s3Config.uploadPrefix}${fileName}`;

      // 上传�?S3
      const command = new PutObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // 新增
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      // 生成文件访问 URL
      const fileUrl = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;

      return {
        key,
        url: fileUrl,
        uploadedAt: new Date(),
      };
    } catch (error) {
      throw new InternalServerErrorException(`文件上传失败: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new InternalServerErrorException(`文件删除失败: ${error.message}`);
    }
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<PresignedUrlResponseDto> {
    try {
      const command = new GetObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return {
        uploadUrl: presignedUrl,
        fileUrl: `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`,
        key,
        expiresIn,
      };
    } catch (error) {
      throw new InternalServerErrorException(`生成预签名URL失败: ${error.message}`);
    }
  }

  async getFileUrl(key: string): Promise<string> {
    return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
  }
}
