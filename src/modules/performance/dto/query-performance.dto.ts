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

  @ApiPropertyOptional({ description: '浏览�?, example: 'Chrome' })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiPropertyOptional({ description: '开始时�?(ISO 8601格式)', example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束时间 (ISO 8601格式)', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
    enum: ['createdAt', 'lcp', 'fcp', 'fid', 'cls', 'ttfb'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: '排序方向', example: 'DESC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

/**
 * 性能统计查询DTO
 */
export class PerformanceStatsDto {
  @ApiPropertyOptional({ description: '页面URL（精确匹配）', example: 'https://example.com/page' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: '开始时�?(ISO 8601格式)', example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束时间 (ISO 8601格式)', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: '分组维度',
    example: 'url',
    enum: ['url', 'deviceType', 'browser', 'os', 'date'],
  })
  @IsOptional()
  @IsString()
  groupBy?: string = 'url';
}
