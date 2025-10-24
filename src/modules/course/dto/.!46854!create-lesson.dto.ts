import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: '章节标题',
    example: '第一章：区块链基础概念',
  })
  @IsNotEmpty({ message: '章节标题不能为空' })
  @IsString({ message: '章节标题必须是字符串' })
  title: string;

  @ApiProperty({
    description: '章节描述',
