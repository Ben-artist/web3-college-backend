import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { COURSE_DIFFICULTY, COURSE_STATUS, IS_FREE } from 'src/config/constant';

export class SearchCourseDto {
  @ApiProperty({
    description: '关键词',
    example: '区块链',
  })
  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;

  @ApiProperty({
    description: '课程分类',
    example: ['区块链基础', 'Web3', 'Solidity'],
  })
  @IsOptional()
  @IsArray({ message: '课程分类必须是数组' })
  @IsString({ each: true, message: '课程分类数组中的每个元素必须是字符串' })
  categories?: string[];

  @ApiProperty({
    description: '课程难度',
    example: COURSE_DIFFICULTY.BEGINNER,
    enum: Object.values(COURSE_DIFFICULTY),
  })
  @IsOptional()
  @IsEnum(Object.values(COURSE_DIFFICULTY), {
    message: '课程难度必须是1、2或3',
  })
  difficulty?: string;

  @ApiProperty({
    description: '是否免费',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: '是否免费必须是布尔值' })
  isFree?: boolean;

  @ApiProperty({
    description: '价格排序',
    example: 'ASC',
  })
  @IsOptional()
  @IsEnum(Object.values(['ASC', 'DESC']), {
    message: '价格排序必须是ASC或DESC',
  })
  sortByPrice?: 'ASC' | 'DESC';

  @ApiProperty({
    description: '评分排序',
    example: 'ASC',
  })
  @IsOptional()
  @IsEnum(Object.values(['ASC', 'DESC']), {
    message: '评分排序必须是ASC或DESC',
  })
  sortByRating?: 'ASC' | 'DESC';

  @ApiProperty({
    description: '日期排序',
    example: 'ASC',
  })
  @IsOptional()
  @IsEnum(Object.values(['ASC', 'DESC']), {
    message: '日期排序必须是ASC或DESC',
  })
  sortByDate?: 'ASC' | 'DESC';
}