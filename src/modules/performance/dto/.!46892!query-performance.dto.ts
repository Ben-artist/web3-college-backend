import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * 查询性能数据DTO
 */
export class QueryPerformanceDto {
  @ApiPropertyOptional({ description: '页面URL（模糊匹配）', example: 'https://example.com' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: '用户钱包地址',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsOptional()
  @IsString()
  walletAddress?: string;

  @ApiPropertyOptional({
    description: '设备类型',
    example: 'desktop',
    enum: ['mobile', 'tablet', 'desktop'],
  })
  @IsOptional()
  @IsString()
  deviceType?: string;

