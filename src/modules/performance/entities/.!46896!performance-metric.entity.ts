import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 性能监控指标实体
 * 存储前端性能数据，用于分析和优化
 */
@Entity('performance_metrics')
@Index(['url', 'createdAt']) // 为URL和创建时间创建索引，提升查询性能
