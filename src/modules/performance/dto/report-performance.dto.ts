import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

/**
 * 上报性能数据DTO
 */
export class ReportPerformanceDto {
  // ===== 页面信息 =====

  @ApiProperty({ description: '页面URL', example: 'https://example.com/page' })
  @IsUrl({}, { message: '页面URL格式不正�? })
  url: string;

  @ApiPropertyOptional({ description: '页面标题', example: '课程详情�? })
  @IsOptional()
  @IsString()
  pageTitle?: string;

  // ===== 用户信息 =====

  @ApiPropertyOptional({ description: '用户代理', example: 'Mozilla/5.0...' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: '用户钱包地址',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsOptional()
  @IsString()
  walletAddress?: string;

  // ===== 核心Web指标 =====

  @ApiPropertyOptional({ description: 'First Contentful Paint (毫秒)', example: 1200.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fcp?: number;

  @ApiPropertyOptional({ description: 'Largest Contentful Paint (毫秒)', example: 2500.3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lcp?: number;

  @ApiPropertyOptional({ description: 'First Input Delay (毫秒)', example: 100.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fid?: number;

  @ApiPropertyOptional({ description: 'Cumulative Layout Shift', example: 0.1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cls?: number;

  @ApiPropertyOptional({ description: 'Time to First Byte (毫秒)', example: 300.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ttfb?: number;

  @ApiPropertyOptional({ description: 'First Meaningful Paint (毫秒)', example: 1500.8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fmp?: number;

  // ===== 性能评分 =====

  @ApiPropertyOptional({
    description: 'FCP评分',
    example: 'good',
    enum: ['good', 'needs-improvement', 'poor'],
  })
  @IsOptional()
  @IsString()
  fcpScore?: string;

  @ApiPropertyOptional({
    description: 'LCP评分',
    example: 'good',
    enum: ['good', 'needs-improvement', 'poor'],
  })
  @IsOptional()
  @IsString()
  lcpScore?: string;

  @ApiPropertyOptional({
    description: 'FID评分',
    example: 'good',
    enum: ['good', 'needs-improvement', 'poor'],
  })
  @IsOptional()
  @IsString()
  fidScore?: string;

  @ApiPropertyOptional({
    description: 'CLS评分',
    example: 'good',
    enum: ['good', 'needs-improvement', 'poor'],
  })
  @IsOptional()
  @IsString()
  clsScore?: string;

  // ===== 资源加载信息 =====

  @ApiPropertyOptional({ description: 'DNS查询时间 (毫秒)', example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dnsTime?: number;

  @ApiPropertyOptional({ description: 'TCP连接时间 (毫秒)', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tcpTime?: number;

  @ApiPropertyOptional({ description: 'SSL握手时间 (毫秒)', example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sslTime?: number;

  @ApiPropertyOptional({ description: '请求响应时间 (毫秒)', example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  requestTime?: number;

  @ApiPropertyOptional({ description: '资源下载时间 (毫秒)', example: 300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  downloadTime?: number;

  @ApiPropertyOptional({ description: 'DOM解析时间 (毫秒)', example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  domParseTime?: number;

  @ApiPropertyOptional({ description: 'DOM内容加载完成时间 (毫秒)', example: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  domContentLoadedTime?: number;

  @ApiPropertyOptional({ description: '页面完全加载时间 (毫秒)', example: 2000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  loadTime?: number;

  // ===== 设备和网络信�?=====

  @ApiPropertyOptional({
    description: '设备类型',
    example: 'desktop',
    enum: ['mobile', 'tablet', 'desktop'],
  })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiPropertyOptional({ description: '操作系统', example: 'Windows 10' })
  @IsOptional()
  @IsString()
  os?: string;

  @ApiPropertyOptional({ description: '浏览�?, example: 'Chrome' })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiPropertyOptional({ description: '浏览器版�?, example: '120.0.0' })
  @IsOptional()
  @IsString()
  browserVersion?: string;

  @ApiPropertyOptional({ description: '网络类型', example: '4g' })
  @IsOptional()
  @IsString()
  connectionType?: string;

  @ApiPropertyOptional({ description: '下行速度 (Mbps)', example: 10.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  downlink?: number;

  @ApiPropertyOptional({ description: '往返时�?(毫秒)', example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rtt?: number;

  // ===== 错误信息 =====

  @ApiPropertyOptional({ description: 'JavaScript错误数量', example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  errorCount?: number;

  @ApiPropertyOptional({
    description: '错误详情(JSON字符�?',
    example: '[{"message":"Error message","stack":"..."}]',
  })
  @IsOptional()
  @IsString()
  errors?: string;

  // ===== 附加数据 =====

  @ApiPropertyOptional({
    description: '额外元数�?JSON字符�?',
    example: '{"customField":"value"}',
  })
  @IsOptional()
  @IsString()
  metadata?: string;

  @ApiPropertyOptional({ description: '会话ID', example: 'session-123-456' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: '监控SDK版本', example: '1.0.0' })
  @IsOptional()
  @IsString()
  sdkVersion?: string;

  @ApiPropertyOptional({ description: '性能数据采集时间�?, example: 1640995200000 })
  @IsOptional()
  @IsNumber()
  timestamp?: number;
}
