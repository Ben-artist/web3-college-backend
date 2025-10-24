import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { COURSE_DIFFICULTY, IS_FREE } from 'src/config/constant';

export class CreateCourseDto {
  @ApiProperty({
    description: '创建者钱包地址',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsNotEmpty({ message: '钱包地址不能为空' })
  walletAddress: string;

  @ApiProperty({
    description: '课程标题',
    example: 'Web3区块链开发入�?,
  })
  @IsNotEmpty({ message: '课程标题不能为空' })
  @IsString({ message: '课程标题必须是字符串' })
  title: string;

  @ApiProperty({
    description: '课程描述',
    example: '从零开始学习Web3和区块链开发技�?,
  })
  @IsNotEmpty({ message: '课程描述不能为空' })
  @IsString({ message: '课程描述必须是字符串' })
  description: string;

  @ApiProperty({
    description: '课程封面URL',
    example: 'https://ipfs.io/ipfs/Qm...',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: '课程封面必须是有效的URL' })
  cover?: string;

  @ApiProperty({
    description: '课程分类',
    example: ['区块链基础', 'Web3', 'Solidity'],
  })
  @IsNotEmpty({ message: '课程分类不能为空' })
  @IsArray({ message: '课程分类必须是数�? })
  @IsString({ each: true, message: '课程分类数组中的每个元素必须是字符串' })
  categories: string[];

  @ApiProperty({
    description: '课程难度',
    example: COURSE_DIFFICULTY.BEGINNER,
    enum: Object.values(COURSE_DIFFICULTY),
  })
  @IsNotEmpty({ message: '课程难度不能为空' })
  @IsEnum(Object.values(COURSE_DIFFICULTY), {
    message: '课程难度必须是beginner、intermediate或advanced',
  })
  difficulty: string;

  @ApiProperty({
    description: 'YD币价�?,
    example: '100',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'YD币价格必须是字符�? })
  price?: string;

  @ApiProperty({
    description: '课程时长（分钟）',
    example: 120,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '课程时长必须是数�? })
  duration?: number;

  @ApiProperty({
    description: '是否免费',
    example: IS_FREE.FALSE,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '是否免费必须是字符串' })
  @IsEnum(Object.values(IS_FREE), { message: '是否免费必须�?�?' })
  isFree?: string;

  @ApiProperty({
    description: '课程标签',
    example: ['区块�?, 'Web3', 'Solidity'],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: '课程标签必须是数�? })
  @IsString({ each: true, message: '课程标签数组中的每个元素必须是字符串' })
  tags?: string[];

  @ApiProperty({
    description: '学习目标',
    example: ['掌握Solidity基础', '能够开发智能合�?],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: '学习目标必须是数�? })
  @IsString({ each: true, message: '学习目标数组中的每个元素必须是字符串' })
  learningObjectives?: string[];

  @ApiProperty({
    description: '前置要求',
    example: ['JavaScript基础', '区块链概�?],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: '前置要求必须是数�? })
  @IsString({ each: true, message: '前置要求数组中的每个元素必须是字符串' })
  prerequisites?: string[];
}
