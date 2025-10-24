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
