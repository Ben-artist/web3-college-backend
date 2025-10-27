import * as crypto from 'node:crypto';
import * as path from 'node:path';
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createS3Client, s3Config } from './config/s3.config';
import { FileType } from './dto/upload.dto';
import type { 
  CompleteMultipartUploadResponseDto, 
  FileUploadResponseDto, 
  GetUploadPartUrlResponseDto, 
  InitiateMultipartUploadResponseDto, 
  PartInfoDto,
} from './dto/upload.dto';
@Injectable()
export class S3Service { 
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;

  constructor() {
    this.s3Client = createS3Client();
  }

  async uploadFile(file: Express.Multer.File, fileType: FileType): Promise<FileUploadResponseDto> {
    try {
      // 验证文件类型
      if (!s3Config.allowedFileTypes.includes(file.mimetype)) {
        throw new BadRequestException(`不支持的文件类型: ${file.mimetype}`);
      }

      // 验证文件大小
      // if (file.size > s3Config.maxFileSize) {
      //   throw new BadRequestException(`文件大小超过限制: ${s3Config.maxFileSize} bytes`);
      // }

      // 根据fileType生成不同的路径前缀
      const typePrefix = this.getTypePrefix(fileType);
      
      // 生成唯一文件名
      const fileExtension = path.extname(file.originalname);
      const fileName = `${crypto.randomUUID()}${fileExtension}`;
      const key = `${typePrefix}${fileName}`;

      // 上传到S3
      // 注意：S3 元数据只支持 ASCII 字符，所以对文件名进行 Base64 编码
      const encodedFileName = Buffer.from(file.originalname).toString('base64');
      
      const command = new PutObjectCommand({ 
        Bucket: s3Config.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          'original-name': encodedFileName, // Base64 编码的文件名
          'uploaded-at': new Date().toISOString(),
          'file-type': fileType,
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

  /**
   * 根据文件类型获取路径前缀
   */
  private getTypePrefix(fileType: FileType): string {
    const prefixMap = {
      [FileType.AVATAR]: 'avatars/',
      [FileType.COURSE_COVER]: 'course-covers/',
      [FileType.VIDEO]: 'videos/',
    };
    
    return prefixMap[fileType] || 'uploads/';
  }

  /**
   * 初始化分片上传
   */
  async initiateMultipartUpload(
    fileName: string,
    contentType: string,
  ): Promise<InitiateMultipartUploadResponseDto> {
    try {
      // 生成唯一文件名
      const fileExtension = path.extname(fileName);
      const uniqueFileName = `${crypto.randomUUID()}${fileExtension}`;
      const key = `${this.getTypePrefix(FileType.VIDEO)}${uniqueFileName}`;

      // 创建分片上传
      // 注意：S3 元数据只支持 ASCII 字符，所以对文件名进行 Base64 编码
      const encodedFileName = Buffer.from(fileName).toString('base64');
      
      const command = new CreateMultipartUploadCommand({
        Bucket: s3Config.bucketName,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read',
        Metadata: {
          'original-name': encodedFileName, // Base64 编码的文件名
          'uploaded-at': new Date().toISOString(),
        },
      });

      const response = await this.s3Client.send(command);

      if (!response.UploadId) {
        throw new InternalServerErrorException('初始化分片上传失败');
      }

      return {
        uploadId: response.UploadId,
        key,
      };
    } catch (error) {
      throw new InternalServerErrorException(`初始化分片上传失败: ${error.message}`);
    }
  }

  /**
   * 获取分片上传URL
   */
  async getUploadPartUrl(
    key: string,
    uploadId: string,
    partNumber: number,
  ): Promise<GetUploadPartUrlResponseDto> {
    try {
      const command = new UploadPartCommand({
        Bucket: s3Config.bucketName,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
      });

      // 生成预签名URL，有效期1小时
      // 注意：CORS 必须在 S3 bucket 上配置，参考 S3-CORS-SETUP.md
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // 1小时
      });

      return {
        uploadUrl,
      };
    } catch (error) {
      throw new InternalServerErrorException(`获取分片上传URL失败: ${error.message}`);
    }
  }

  /**
   * 完成分片上传
   */
  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: PartInfoDto[],
    duration?: number,
  ): Promise<CompleteMultipartUploadResponseDto> {
    try {
      // 验证 parts 数组
      if (!parts || parts.length === 0) {
        throw new BadRequestException('分片列表不能为空');
      }

      // 格式化 parts：确保 ETag 包含引号，并按 PartNumber 排序
      const formattedParts = parts
        .map((part) => ({
          PartNumber: part.PartNumber,
          // 确保 ETag 有引号包裹（S3 要求格式）
          ETag: part.ETag.startsWith('"') ? part.ETag : `"${part.ETag}"`,
        }))
        .sort((a, b) => a.PartNumber - b.PartNumber);

      this.logger.log(`完成分片上传: key=${key}, uploadId=${uploadId}, parts=${formattedParts.length}个`);

      const command = new CompleteMultipartUploadCommand({
        Bucket: s3Config.bucketName,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: formattedParts,
        },
      });

      const response = await this.s3Client.send(command);

      // 生成文件访问 URL
      const url = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;

      this.logger.log(`分片上传完成: ${url}`);

      return {
        key,
        url,
        duration,
        uploadedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`完成分片上传失败: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`完成分片上传失败: ${error.message}`);
    }
  }

  /**
   * 取消分片上传（可选，用于清理未完成的上传）
   */
  async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
    try {
      const { AbortMultipartUploadCommand } = await import('@aws-sdk/client-s3');
      const command = new AbortMultipartUploadCommand({
        Bucket: s3Config.bucketName,
        Key: key,
        UploadId: uploadId,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new InternalServerErrorException(`取消分片上传失败: ${error.message}`);
    }
  }
}
