// user-chapter-progress.entity.ts
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { CommonEntity } from '../../../common/entities/common.entity';
import { User } from '../../user/entities/user.entity';
import { Chapter } from './chapter.entity';

@Entity('user_chapter_progress')
@Unique(['user', 'chapter'])
@Index(['user'])
@Index(['chapter'])
export class UserChapterProgress extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Chapter, { onDelete: 'CASCADE' })
  chapter: Chapter;

  @Column({ name: 'chapter_id' })
  chapterId: number;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'last_watch_time', default: 0 })
  lastWatchTime: number;
}
