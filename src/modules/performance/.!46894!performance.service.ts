import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, type Repository } from 'typeorm';
import type { PerformanceStatsDto, QueryPerformanceDto } from './dto/query-performance.dto';
import type { ReportPerformanceDto } from './dto/report-performance.dto';
import { PerformanceMetric } from './entities/performance-metric.entity';

/**
 * 性能监控服务
 * 负责性能数据的存储、查询和统计分析
 */
@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(
    @InjectRepository(PerformanceMetric)
    private readonly performanceRepository: Repository<PerformanceMetric>
  ) {}

  /**
   * 上报性能数据
   * @param dto 性能数据
   * @param ipAddress 客户端IP地址
   * @returns 保存的性能数据记录
   */
  async reportPerformance(
    dto: ReportPerformanceDto,
    ipAddress?: string
  ): Promise<PerformanceMetric> {
    try {
      const metric = this.performanceRepository.create({
        ...dto,
        ipAddress,
        timestamp: dto.timestamp || Date.now(),
      });

      const saved = await this.performanceRepository.save(metric);
