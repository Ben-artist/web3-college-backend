import { CommonEntity } from 'src/common/entities/common.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { NFTCertificate } from '../../certificate/entities/nft-certificate.entity';
import { Course } from '../../course/entities/course.entity';
import { UserCourseFavorite } from '../../course/entities/user-course-favorite.entity';
import { UserCourseProgress } from '../../course/entities/user-course-progress.entity';
import { UserCoursePurchase } from '../../course/entities/user-course-purchase.entity';
@Entity('users')
export class User extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Web3核心字段 - 钱包地址作为主要标识
  @Column({ name: 'wallet_address', unique: true })
  walletAddress: string;

  // 用户名也不能重复，如果没有传，就使用钱包地址的前8位
  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  // 讲师简介
  @Column({ type: 'text', nullable: true })
  bio?: string;

  // 专业领域，多选- 使用JSON存储
  @Column({ type: 'json', nullable: true })
  specializations?: string[];

  // 是否完成讲师注册
  @Column({ default: false })
  isInstructorRegistered: boolean;

  // 是否通过讲师审核
  @Column({ default: true })
  isInstructorApproved: boolean;

  // 作为讲师创建的课程
  @OneToMany(
    () => Course,
    (course) => course.instructor,
    {
      cascade: true,
    }
  )
  createdCourses: Course[];

  // 收藏的课程
  @OneToMany(
    () => UserCourseFavorite,
    (favorite) => favorite.user,
    {
      cascade: true,
    }
  )
  favoriteCourses: UserCourseFavorite[];

  // 购买的课程
  @OneToMany(
    () => UserCoursePurchase,
    (purchase) => purchase.user,
    {
      cascade: true,
    }
  )
  purchasedCourses: UserCoursePurchase[];

  // 学习进度关系记录
  @OneToMany(
    () => UserCourseProgress,
    (progress) => progress.user,
    {
      cascade: true,
    }
  )
  courseProgresses: UserCourseProgress[];

  // NFT证书记录
  @OneToMany(
    () => NFTCertificate,
    (certificate) => certificate.user
  )
  certificates: NFTCertificate[];
}
