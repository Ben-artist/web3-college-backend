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
 * 用户课程学习进度实体
 * 关联表设计，存储用户与课程的详细学习记录
 */
@Entity('user_course_progress')
@Unique(['user', 'course'])
@Index(['user'])
@Index(['course'])
export class UserCourseProgress extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 课程ID
  @Column({ name: 'course_id' })
  courseId: number;

  // 用户ID
  @Column({ name: 'user_id' })
  userId: number;

  // 关联用户
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  // 关联课程
  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id', referencedColumnName: 'courseId' })
  course: Course;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  progress: number;

  // 是否已购买 
   @Column({ default: false, name: 'is_paid' })
  isPaid: boolean;

  // 是否已完成 完成需要发放NFT证书
  @Column({ default: false, name: 'is_completed' })
  isCompleted: boolean;

  // 购买时间
  @Column({ nullable: true, name: 'paid_at' })
  paidAt?: Date;

  @Column({ name: 'last_study_at', type: 'timestamp', nullable: true })
  lastStudyAt?: Date;

  // 购买交易哈希
  @Column({ nullable: true, name: 'payment_transaction_hash' })
  paymentTransactionHash?: string;

  // 用户评分
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  userRating?: number;

  // 评分时间
  @Column({ nullable: true, name: 'rated_at' })
  ratedAt?: Date;
}
