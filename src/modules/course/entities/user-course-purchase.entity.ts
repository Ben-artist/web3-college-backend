import { CommonEntity } from 'src/common/entities/common.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from './course.entity';

/**
 * 用户课程购买记录实体
 * 记录用户购买课程的详细信息，包括支付信息
 */
@Entity('user_course_purchases')
@Unique(['user', 'course'])
@Index(['user'])
@Index(['course'])
@Index(['transactionHash'])
export class UserCoursePurchase extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 用户ID
  @Column({ name: 'user_id' })
  userId: number;

  // 课程ID
  @Column({ name: 'course_id' })
  courseId: number;

  // 关联用户
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  // 关联课程
  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id', referencedColumnName: 'courseId' })
  course: Course;

  // 支付金额（YD币）
  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: string;

  // 支付状态：pending 确认 失败 退款
  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'failed', 'refunded'],
    default: 'pending',
  })
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';

  // 区块链交易哈希
  @Column({ name: 'transaction_hash', nullable: true })
  transactionHash?: string;

  // 支付时间
  @Column({ name: 'paid_at', nullable: true })
  paidAt?: Date;

  // 退款时间  
  @Column({ name: 'refunded_at', nullable: true })
  refundedAt?: Date;

  // 退款交易哈希
  @Column({ name: 'refund_transaction_hash', nullable: true })
  refundTransactionHash?: string;

  // 备注
  @Column({ type: 'text', nullable: true })
  notes?: string;
}
