import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 文件类型枚举
 */
export enum FileType {
  AVATAR = 'avatar',
  COURSE_COVER = 'course_cover',
  VIDEO = 'video',
}

/**
 * 上传文件DTO
 */
export class UploadFileDto {
  @ApiProperty({
    description: '文件类型',
    enum: FileType,
    example: FileType.AVATAR,
  })
  @IsEnum(FileType)
  fileType: FileType;

  @ApiProperty({
    description: '文件名称',
    example: 'avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty({
    description: '文件描述',
    example: '用户头像',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * 生成预签名URL DTO
 */
export class GeneratePresignedUrlDto {
  @ApiProperty({
    description: '文件类型',
    enum: FileType,
    example: FileType.COURSE_COVER,
  })
  @IsEnum(FileType)
  fileType: FileType;

  @ApiProperty({
    description: '文件名称',
    example: 'course-cover.jpg',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: '文件MIME类型',
    example: 'image/jpeg',
  })
  @IsString()
  contentType: string;

  @ApiProperty({
    description: '文件大小（字节）',
    example: 1024000,
  })
  fileSize: number;
}

/**
 * 文件上传响应DTO
 */
export class FileUploadResponseDto {
  @ApiProperty({
    description: '文件键名',
    example: 'avatars/user-123.jpg',
  })
  key: string;

  @ApiProperty({
    description: '上传时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  uploadedAt: Date;
  @ApiProperty({
    description: '文件URL',
    example: 'https://your-bucket.s3.amazonaws.com/avatars/user-123.jpg',
  })
  url: string;
}

/**
 * 预签名URL响应DTO
 */
export class PresignedUrlResponseDto {
  @ApiProperty({
    description: '预签名上传URL',
    example: 'https://your-bucket.s3.amazonaws.com/avatars/user-123.jpg?...',
  })
  uploadUrl: string;

  @ApiProperty({
    description: '文件访问URL',
    example: 'https://your-bucket.s3.amazonaws.com/avatars/user-123.jpg',
  })
  fileUrl: string;

  @ApiProperty({
    description: '文件键名',
    example: 'avatars/user-123.jpg',
  })
  key: string;

  @ApiProperty({
    description: '过期时间（秒）',
    example: 3600,
  })
  expiresIn: number;
}

/**
 * 初始化分片上传DTO
 */
export class InitiateMultipartUploadDto {
  @ApiProperty({
    description: '文件名称',
    example: 'video-lesson-1.mp4',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: '文件MIME类型',
    example: 'video/mp4',
  })
  @IsString()
  contentType: string;

  @ApiProperty({
    description: '视频时长（秒）',
    example: 1800,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duration?: number;
}

/**
 * 初始化分片上传响应DTO
 */
export class InitiateMultipartUploadResponseDto {
  @ApiProperty({
    description: '上传ID',
    example: 'upload-123-abc',
  })
  uploadId: string;

  @ApiProperty({
    description: '文件键名',
    example: 'videos/video-123.mp4',
  })
  key: string;
}

/**
 * 获取分片上传URL DTO
 */
export class GetUploadPartUrlDto {
  @ApiProperty({
    description: '文件键名',
    example: 'videos/video-123.mp4',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: '上传ID',
    example: 'upload-123-abc',
  })
  @IsString()
  uploadId: string;

  @ApiProperty({
    description: '分片编号（从1开始）',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  partNumber: number;
}

/**
 * 获取分片上传URL响应DTO
 */
export class GetUploadPartUrlResponseDto {
  @ApiProperty({
    description: '分片上传URL',
    example: 'https://your-bucket.s3.amazonaws.com/videos/video-123.mp4?...',
  })
  uploadUrl: string;
}

/**
 * 分片信息DTO
 */
export class PartInfoDto {
  @ApiProperty({
    description: '分片编号',
    example: 1,
  })
  @IsInt()
  @Min(1)
  PartNumber: number;

  @ApiProperty({
    description: 'ETag',
    example: '"abc123"',
  })
  @IsString()
  ETag: string;
}

/**
 * 完成分片上传DTO
 */
export class CompleteMultipartUploadDto {
  @ApiProperty({
    description: '文件键名',
    example: 'videos/video-123.mp4',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: '上传ID',
    example: 'upload-123-abc',
  })
  @IsString()
  uploadId: string;

  @ApiProperty({
    description: '分片信息列表',
    type: [PartInfoDto],
    example: [
      { PartNumber: 1, ETag: '"abc123"' },
      { PartNumber: 2, ETag: '"def456"' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartInfoDto)
  parts: PartInfoDto[];

  @ApiProperty({
    description: '视频时长（秒）',
    example: 1800,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duration?: number;
}

/**
 * 完成分片上传响应DTO
 */
export class CompleteMultipartUploadResponseDto {
  @ApiProperty({
    description: '文件键名',
    example: 'videos/video-123.mp4',
  })
  key: string;

  @ApiProperty({
    description: '文件访问URL',
    example: 'https://your-bucket.s3.amazonaws.com/videos/video-123.mp4',
  })
  url: string;

  @ApiProperty({
    description: '视频时长（秒）',
    example: 1800,
    required: false,
  })
  duration?: number;

  @ApiProperty({
    description: '上传完成时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  uploadedAt: Date;
}
