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
 * 用户课程收藏实体
 * 记录用户收藏的课程，与购买记录分�? */
@Entity('user_course_favorites')
@Unique(['user', 'course'])
@Index(['user'])
@Index(['course'])
export class UserCourseFavorite extends CommonEntity {
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
}