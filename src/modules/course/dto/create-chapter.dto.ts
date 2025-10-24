import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateChapterDto {
  @ApiProperty({
    description: '课程ID',
    example: 1,
  })
  @IsNotEmpty({ message: '课程ID不能为空' })
  @IsNumber({}, { message: '课程ID必须是数字' })
  courseId: number;

  @ApiProperty({
    description: '章节标题',
    example: '第一章：区块链基础概念',
  })
  @IsNotEmpty({ message: '章节标题不能为空' })
  @IsString({ message: '章节标题必须是字符串' })
  title: string;

  @ApiProperty({
    description: '章节描述',
    example: '介绍区块链的基本概念和原理',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '章节描述必须是字符串' })
  description?: string;

  @ApiProperty({
    description: '视频URL',
    example: 'https://ipfs.io/ipfs/Qm...',
    required: false,
  })
  @IsNotEmpty({ message: '视频URL不能为空' })
  @IsUrl({}, { message: '视频URL必须是有效的URL' })
  videoUrl: string;

  @ApiProperty({
    description: '视频时长（秒）',
    example: 1800,
    required: false,
  })
  @IsNotEmpty({ message: '视频时长不能为空' })
  @IsNumber({}, { message: '视频时长必须是数字' })
  duration: number;

  @ApiProperty({
    description: '章节顺序',
    example: 1,
  })
  @IsNotEmpty({ message: '章节顺序不能为空' })
  @IsNumber({}, { message: '章节顺序必须是数字' })
  orderSequence: number;

  @ApiProperty({
    description: '是否免费预览',
    example: false,
    required: false,
  })
  @IsNotEmpty({ message: '是否免费预览不能为空' })
  @IsBoolean({ message: '是否免费预览必须是布尔值' })
  isFreePreview: boolean;
}
