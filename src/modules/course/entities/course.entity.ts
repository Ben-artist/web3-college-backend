import { CommonEntity } from 'src/common/entities/common.entity';
import { COURSE_DIFFICULTY, COURSE_STATUS } from 'src/config/constant';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { NFTCertificate } from '../../certificate/entities/nft-certificate.entity';
import { User } from '../../user/entities/user.entity';
import { UserCourseProgress } from './user-course-progress.entity';
import { Chapter } from '../../chapter/entities/chapter.entity';
/**
 * 课程实体 - 课程系列/集合
 * 包含多个章节的完整课程 */
@Entity('courses')
export class Course extends CommonEntity {
  @PrimaryGeneratedColumn()
  courseId: number;
  // 基本信息
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'cover_url', nullable: true })
  coverUrl?: string; // 课程封面

  // 课程时长
  @Column({ name: 'total_duration', default: 0 })
  totalDuration: number;

  // 课程状态：草稿 等待审核 已发布 已拒绝  
  @Column({ name: 'course_status', default: COURSE_STATUS.DRAFT })
  courseStatus: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  // 讲师ID
  @Column({ name: 'instructor_id' })
  instructorId: number;

  // 讲师钱包地址（冗余存储，方便直接查询）  
   @Column({ name: 'instructor_wallet_address', nullable: true })
  instructorWalletAddress?: string;

  // 课程分类
  @Column({ type: 'json' })
  categories: string[]; // "区块链基础"

  // 课程难度
  @Column({ default: COURSE_DIFFICULTY.BEGINNER })
  difficulty: string;

  // 评分
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rating: number;

  // 课程标签
  @Column({ type: 'json', nullable: true })
  tags?: string[];

  // 学习目标
  @Column({ type: 'json', nullable: true })
  learningObjectives?: string[];

  // 前置要求
  @Column({ type: 'json', nullable: true })
  prerequisites?: string[];

  // 讲师关系
  @ManyToOne(
    () => User,
    (user) => user.createdCourses
  )
  @JoinColumn({
    name: 'instructorId',
    referencedColumnName: 'id',
  })
  instructor: User;

  // 一个课程包含多个章节
  @OneToMany(
    () => Chapter,
    (chapter) => chapter.course,
    { cascade: true }
  )
  chapters: Chapter[];

  // NFT证书记录
  @OneToMany(
    () => NFTCertificate,
    (certificate) => certificate.course
  )
  certificates: NFTCertificate[];

  // 用户课程进度记录
  @OneToMany(
    () => UserCourseProgress,
    (progress) => progress.course
  )
  userCourseProgresses: UserCourseProgress[];
}