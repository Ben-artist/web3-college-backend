import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

/**
 * 上报性能数据DTO
 */
export class ReportPerformanceDto {
  // ===== 页面信息 =====

  @ApiProperty({ description: '页面URL', example: 'https://example.com/page' })
