import { CommonEntity } from 'src/common/entities/common.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { UserChapterProgress } from './user-chapter-progress.entity';
/**
 * 章节实体 - 单个课程章节
 * 属于某个课程的具体章节内�? */
@Entity('chapters')
@Index(['course', 'sortOrder'])
export class Chapter extends CommonEntity {
  @PrimaryGeneratedColumn()
  chapterId: number;

  // 基本信息
  @Column()
  title: string;

  // 视频时长（秒�?  @Column({ default: 0 })
  duration: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // 视频链接
  @Column({ nullable: true, name: 'video_url' })
  videoUrl?: string;

  // 章节顺序
  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  // 是否免费
  @Column({ default: false })
  isFree: boolean;

  // 关联的课�?  @Column({ name: 'course_id' })
  courseId: number;

  @ManyToOne(
    () => Course,
    (course) => course.chapters
  )
  @JoinColumn({ name: 'course_id' })
  course: Course;

  // 用户章节学习进度
  @OneToMany(
    () => UserChapterProgress,
    (user) => user.chapter,
    {
      cascade: true,
    }
  )
  progresses: UserChapterProgress[];
}
