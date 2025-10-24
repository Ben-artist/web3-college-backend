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
      this.logger.log(`性能数据已保�? ID=${saved.id}, URL=${saved.url}`);

      return saved;
    } catch (error) {
      this.logger.error(`保存性能数据失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 查询性能数据列表
   * @param query 查询条件
   * @returns 分页的性能数据列表
   */
  async queryPerformance(query: QueryPerformanceDto) {
    const {
      url,
      walletAddress,
      deviceType,
      browser,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    // 构建查询条件
    const where: any = {};

    if (url) {
      where.url = Like(`%${url}%`);
    }

    if (walletAddress) {
      where.walletAddress = walletAddress;
    }

    if (deviceType) {
      where.deviceType = deviceType;
    }

    if (browser) {
      where.browser = browser;
    }

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = Between(new Date(startDate), new Date());
    }

    // 查询数据
    const [data, total] = await this.performanceRepository.findAndCount({
      where,
      order: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    this.logger.debug(`查询性能数据: �?{total}�? 返回${data.length}条`);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取性能数据详情
   * @param id 性能数据ID
   * @returns 性能数据详情
   */
  async getPerformanceById(id: number): Promise<PerformanceMetric | null> {
    return await this.performanceRepository.findOne({
      where: { id },
    });
  }

  /**
   * 获取性能统计数据
   * @param query 统计查询条件
   * @returns 统计结果
   */
  async getPerformanceStats(query: PerformanceStatsDto) {
    const { url, startDate, endDate, groupBy = 'url' } = query;

    // 构建查询条件
    const where: any = {};

    if (url) {
      where.url = url;
    }

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = Between(new Date(startDate), new Date());
    }

    // 查询所有符合条件的数据
    const metrics = await this.performanceRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });

    if (metrics.length === 0) {
      return {
        total: 0,
        stats: null,
        groupedStats: [],
      };
    }

    // 计算整体统计
    const overallStats = this.calculateStats(metrics);

    // 按维度分组统�?    const groupedStats = this.groupAndCalculateStats(metrics, groupBy);

    return {
      total: metrics.length,
      stats: overallStats,
      groupedStats,
      dateRange: {
        start: startDate || metrics[metrics.length - 1].createdAt,
        end: endDate || metrics[0].createdAt,
      },
    };
  }

  /**
   * 计算性能统计指标
   * @param metrics 性能数据数组
   * @returns 统计结果
   */
  private calculateStats(metrics: PerformanceMetric[]) {
    const validMetrics = metrics.filter((m) => m.lcp || m.fcp || m.fid || m.cls);

    if (validMetrics.length === 0) {
      return null;
    }

    // 计算平均�?    const avg = (arr: number[]) => {
      const filtered = arr.filter((v) => v != null && !Number.isNaN(v));
      return filtered.length > 0
        ? filtered.reduce((sum, val) => sum + val, 0) / filtered.length
        : 0;
    };

    // 计算中位�?    const median = (arr: number[]) => {
      const filtered = arr.filter((v) => v != null && !Number.isNaN(v)).sort((a, b) => a - b);
      if (filtered.length === 0) {
        return 0;
      }
      const mid = Math.floor(filtered.length / 2);
      return filtered.length % 2 === 0 ? (filtered[mid - 1] + filtered[mid]) / 2 : filtered[mid];
    };

    // 计算�?5�?0�?5百分�?    const percentile = (arr: number[], p: number) => {
      const filtered = arr.filter((v) => v != null && !Number.isNaN(v)).sort((a, b) => a - b);
      if (filtered.length === 0) {
        return 0;
      }
      const index = Math.ceil((filtered.length * p) / 100) - 1;
      return filtered[index];
    };

    return {
      lcp: {
        avg: Number(
          avg(validMetrics.map((m) => Number(m.lcp)).filter((v) => !Number.isNaN(v))).toFixed(2)
        ),
        median: Number(median(validMetrics.map((m) => Number(m.lcp))).toFixed(2)),
        p75: Number(
          percentile(
            validMetrics.map((m) => Number(m.lcp)),
            75
          ).toFixed(2)
        ),
        p90: Number(
          percentile(
            validMetrics.map((m) => Number(m.lcp)),
            90
          ).toFixed(2)
        ),
        p95: Number(
          percentile(
            validMetrics.map((m) => Number(m.lcp)),
            95
          ).toFixed(2)
        ),
      },
      fcp: {
        avg: Number(
          avg(validMetrics.map((m) => Number(m.fcp)).filter((v) => !Number.isNaN(v))).toFixed(2)
        ),
        median: Number(median(validMetrics.map((m) => Number(m.fcp))).toFixed(2)),
        p75: Number(
          percentile(
            validMetrics.map((m) => Number(m.fcp)),
            75
          ).toFixed(2)
        ),
        p90: Number(
          percentile(
            validMetrics.map((m) => Number(m.fcp)),
            90
          ).toFixed(2)
        ),
        p95: Number(
          percentile(
            validMetrics.map((m) => Number(m.fcp)),
            95
          ).toFixed(2)
        ),
      },
      fid: {
        avg: Number(
          avg(validMetrics.map((m) => Number(m.fid)).filter((v) => !Number.isNaN(v))).toFixed(2)
        ),
        median: Number(median(validMetrics.map((m) => Number(m.fid))).toFixed(2)),
        p75: Number(
          percentile(
            validMetrics.map((m) => Number(m.fid)),
            75
          ).toFixed(2)
        ),
        p90: Number(
          percentile(
            validMetrics.map((m) => Number(m.fid)),
            90
          ).toFixed(2)
        ),
        p95: Number(
          percentile(
            validMetrics.map((m) => Number(m.fid)),
            95
          ).toFixed(2)
        ),
      },
      cls: {
        avg: Number(
          avg(validMetrics.map((m) => Number(m.cls)).filter((v) => !Number.isNaN(v))).toFixed(4)
        ),
        median: Number(median(validMetrics.map((m) => Number(m.cls))).toFixed(4)),
        p75: Number(
          percentile(
            validMetrics.map((m) => Number(m.cls)),
            75
          ).toFixed(4)
        ),
        p90: Number(
          percentile(
            validMetrics.map((m) => Number(m.cls)),
            90
          ).toFixed(4)
        ),
        p95: Number(
          percentile(
            validMetrics.map((m) => Number(m.cls)),
            95
          ).toFixed(4)
        ),
      },
      ttfb: {
        avg: Number(
          avg(validMetrics.map((m) => Number(m.ttfb)).filter((v) => !Number.isNaN(v))).toFixed(2)
        ),
        median: Number(median(validMetrics.map((m) => Number(m.ttfb))).toFixed(2)),
        p75: Number(
          percentile(
            validMetrics.map((m) => Number(m.ttfb)),
            75
          ).toFixed(2)
        ),
        p90: Number(
          percentile(
            validMetrics.map((m) => Number(m.ttfb)),
            90
          ).toFixed(2)
        ),
        p95: Number(
          percentile(
            validMetrics.map((m) => Number(m.ttfb)),
            95
          ).toFixed(2)
        ),
      },
      sampleSize: validMetrics.length,
    };
  }

  /**
   * 按维度分组并计算统计
   * @param metrics 性能数据数组
   * @param groupBy 分组维度
   * @returns 分组统计结果
   */
  private groupAndCalculateStats(metrics: PerformanceMetric[], groupBy: string) {
    // 按指定维度分�?    const grouped = metrics.reduce(
      (acc, metric) => {
        let key = '';

        switch (groupBy) {
          case 'url':
            key = metric.url;
            break;
          case 'deviceType':
            key = metric.deviceType || 'unknown';
            break;
          case 'browser':
            key = metric.browser || 'unknown';
            break;
          case 'os':
            key = metric.os || 'unknown';
            break;
          case 'date':
            key = new Date(metric.createdAt).toISOString().split('T')[0];
            break;
          default:
            key = metric.url;
        }

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(metric);
        return acc;
      },
      {} as Record<string, PerformanceMetric[]>
    );

    // 计算每组的统�?    return Object.entries(grouped).map(([key, groupMetrics]) => ({
      [groupBy]: key,
      count: groupMetrics.length,
      stats: this.calculateStats(groupMetrics),
    }));
  }

  /**
   * 删除指定时间之前的性能数据
   * @param beforeDate 删除此日期之前的数据
   * @returns 删除的记录数
   */
  async deleteOldMetrics(beforeDate: Date): Promise<number> {
    const result = await this.performanceRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :beforeDate', { beforeDate })
      .execute();

    this.logger.log(`删除�?${result.affected} 条旧的性能数据`);
    return result.affected || 0;
  }
}
