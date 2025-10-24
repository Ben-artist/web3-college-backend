import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceMetric } from './entities/performance-metric.entity';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';

/**
 * 性能监控模块
 * 提供前端性能数据收集、存储和分析功能
 */
@Module({
  imports: [TypeOrmModule.forFeature([PerformanceMetric])],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
