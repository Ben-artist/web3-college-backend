import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { PerformanceStatsDto, QueryPerformanceDto } from './dto/query-performance.dto';
import type { ReportPerformanceDto } from './dto/report-performance.dto';
import type { PerformanceService } from './performance.service';

/**
 * 性能监控控制�? * 提供性能数据上报、查询和统计的API接口
 */
@Controller('performance')
@ApiTags('性能监控')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  /**
   * 上报性能数据
   * 支持 sendBeacon �?fetch 两种方式
   * sendBeacon 会发�?text/plain 类型的数�?   */
  @Post('report')
  @HttpCode(HttpStatus.NO_CONTENT) // sendBeacon 不关心响应内�?  @ApiOperation({
    summary: '上报性能数据',
    description: '接收前端通过 sendBeacon �?fetch 发送的性能监控数据',
  })
  @ApiResponse({ status: 204, description: '数据上报成功（无返回内容�? })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async reportPerformance(@Body() dto: ReportPerformanceDto, @Req() request: Request) {
    // 获取客户端IP地址
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      request.socket.remoteAddress;

    // 如果没有传�?userAgent，从请求头获�?    if (!dto.userAgent) {
      dto.userAgent = request.headers['user-agent'];
    }

    await this.performanceService.reportPerformance(dto, ipAddress);

    // sendBeacon 不需要响应体
    return;
  }

  /**
   * 查询性能数据列表
   */
  @Get('list')
  @ApiOperation({
    summary: '查询性能数据列表',
    description: '支持多条件查询和分页',
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  async queryPerformance(@Query() query: QueryPerformanceDto) {
    return await this.performanceService.queryPerformance(query);
  }

  /**
   * 获取性能数据详情
   */
  @Get('detail/:id')
  @ApiOperation({
    summary: '获取性能数据详情',
    description: '根据ID获取单条性能数据的详细信�?,
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '数据不存�? })
  async getPerformanceDetail(@Param('id') id: number) {
    return await this.performanceService.getPerformanceById(id);
  }

  /**
   * 获取性能统计数据
   */
  @Get('stats')
  @ApiOperation({
    summary: '获取性能统计数据',
    description: '计算性能指标的平均值、中位数、百分位等统计信�?,
  })
  @ApiResponse({ status: 200, description: '统计成功' })
  async getPerformanceStats(@Query() query: PerformanceStatsDto) {
    return await this.performanceService.getPerformanceStats(query);
  }

  /**
   * 健康检查接�?   */
  @Get('health')
  @ApiOperation({
    summary: '健康检�?,
    description: '检查性能监控服务是否正常运行',
  })
  @ApiResponse({ status: 200, description: '服务正常' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'performance-monitoring',
    };
  }
}
