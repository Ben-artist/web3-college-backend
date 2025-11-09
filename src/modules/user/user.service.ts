import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { plainToClassFromExist } from 'class-transformer';
import { Course } from '../course/entities/course.entity';
import { UserCourseProgress } from '../course/entities/user-course-progress.entity';
import { UserCourseFavorite } from '../course/entities/user-course-favorite.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { SignatureVerifier } from '../../utils/signature-verifier';

/**
 * 用户服务类
 * 处理用户相关的业务逻辑（使用模拟数据）
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserCourseProgress)
    private userCourseProgressRepository: Repository<UserCourseProgress>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(UserCourseFavorite)
    private userCourseFavoriteRepository: Repository<UserCourseFavorite>,
    private jwtService: JwtService
  ) {}

  /**
   * 根据钱包地址获取用户
   */
  async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { walletAddress },
    });
  }

  /**
   * 根据钱包地址获取用户（别名方法）
   */
  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.getUserByWalletAddress(walletAddress);
  }
  /**
   * 用户登录（支持签名验证）
   */
  async login(loginData: { walletAddress: string; signature: string; message: string }): Promise<{
    user: User;
    token: string;
  }> {
    // 验证签名
    const isValidSignature = await SignatureVerifier.verifySignature(
      loginData.walletAddress,
      loginData.message,
      loginData.signature,
    );

    if (!isValidSignature) {
      throw new UnauthorizedException('无效的签名');
    }

    // 验证消息时间有效性（10分钟内）
    if (!SignatureVerifier.isMessageValid(loginData.message, 10)) {
      throw new UnauthorizedException('消息已过期，请重新签名');
    }
    
    let user = await this.getUserByWalletAddress(loginData.walletAddress);
    if (!user) {
      // 如果用户不存在，自动创建
      user = await this.userRepository.create({
        walletAddress: loginData.walletAddress,
        username: `User_${loginData.walletAddress.slice(0, 8)}`,
      });
      user = await this.userRepository.save(user);
    }

    // 生成JWT token
    const payload = {
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      email: user.email,
      isInstructorRegistered: user.isInstructorRegistered,
      isInstructorApproved: user.isInstructorApproved,
    };
    const token = this.jwtService.sign(payload);

    return { user, token };
  }

  /**
   * 根据钱包地址登录（旧方法，保持兼容性）
   */
  async loginByWalletAddress(walletAddress: string): Promise<{
    user: User;
    token: string;
  }> {
    let user = await this.getUserByWalletAddress(walletAddress);
    if (!user) {
      // 创建用户
      user = await this.userRepository.create({
        walletAddress,
        username: `User_${walletAddress.slice(0, 8)}`,
      });
      user = await this.userRepository.save(user);
    }

    // 使用标准JWT生成token
    const payload = {
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      email: user.email,
      isInstructorRegistered: user.isInstructorRegistered,
      isInstructorApproved: user.isInstructorApproved,
    };

    const token = this.jwtService.sign(payload);
    return { user, token };
  }

  async registerAsInstructor(
    registerUserDto: RegisterUserDto,
    userId: number
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`用户 ${userId} 不存在`);
    }

    // 使用 Object.assign 合并属性，只更新提供的字段
    Object.assign(user, registerUserDto);

    await this.userRepository.save(user);
    return user;
  }

  /**
   * 根据用户ID获取用户详细信息
   * 包含用户的评分和课程购买人数统计
   */
  async getUserById(userId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId }, 
      relations: ['purchasedCourses', 'createdCourses', 'favoriteCourses', 'courseProgresses', 'certificates'] 
    });

    if (!user) {
      return null;
    }

    // 计算用户作为讲师的评分（所有创建课程的平均评分）
    if (user.createdCourses && user.createdCourses.length > 0) {
      const totalRating = user.createdCourses.reduce((sum, course) => sum + Number(course.rating), 0);
      // 将计算结果附加到用户对象上（作为额外属性）
      (user as any).instructorRating = Number((totalRating / user.createdCourses.length).toFixed(2));
    } else {
      (user as any).instructorRating = 0;
    }
    // 统计用户购买的课程数量
    (user as any).totalPurchasedCourses = 0;
    // 为每个创建的课程统计购买人数
    if (user.createdCourses && user.createdCourses.length > 0) {
      for (const course of user.createdCourses) {
        // 统计该课程的购买人数（通过学习进度表统计已支付的用户数）
        const purchaseCount = await this.userCourseProgressRepository.count({
          where: { courseId: course.courseId, isPaid: true }
        }); 
        // 将购买人数附加到课程对象上
        (course as any).purchaseCount = purchaseCount;
        (user as any).totalPurchasedCourses += purchaseCount;
      }
    }
    return user;
  }

  /**
   * 获取用户购买的课程
   */
  async getUserPurchasedCourses(userId: number): Promise<UserCourseProgress[]> {
    return await this.userCourseProgressRepository.find({
      where: { userId: userId, isPaid: true },
      relations: ['course'],
    });
  }

  // 用户已经完成的课程
  async getUserCompletedCoursesByUserId(userId: number): Promise<UserCourseProgress[]> {
    return await this.userCourseProgressRepository.find({
      where: { userId: userId, isPaid: true, isCompleted: true },
      relations: ['course'],
    });
  }

  // 获取用户自己创建的课程
  async getUserCreatedCourses(userId: number): Promise<Course[]> {
    return await this.courseRepository.find({ where: { instructor: { id: userId } } });
  }
  /**
   * 更新用户资料
   */
  async updateProfile(updateProfileDto: UpdateProfileDto, userId: number): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`用户 ${userId} 不存在`);
    }

    // 使用 Object.assign 合并属性，只更新提供的字段
    Object.assign(user, updateProfileDto);

    return await this.userRepository.save(user);
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(userId: number): Promise<{
    totalCourses: number;
    completedCourses: number;
    certificates: number;
    totalLearningTime: number;
  }> {
    const purchasedCourses = await this.getUserPurchasedCourses(userId);
    const completedCourses = await this.getUserCompletedCoursesByUserId(userId);
    
    return {
      totalCourses: purchasedCourses.length,
      completedCourses: completedCourses.length,
      certificates: completedCourses.length, // 假设每个完成的课程都有一个证书
      totalLearningTime: completedCourses.reduce((total, course) => total + (course.course?.totalDuration || 0), 0),
    };
  }

  /**
   * 获取用户收藏的课程
   */
  async getUserFavoriteCourses(userId: number): Promise<any[]> {
    const favorites = await this.userCourseFavoriteRepository.find({
      where: { userId },
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
    
    // 返回课程信息数组
    return favorites.map(fav => fav.course).filter(course => course !== null);
  }

  /**
   * 获取用户学习进度
   */
  async getUserLearningProgress(userId: number): Promise<any[]> {
    return await this.userCourseProgressRepository.find({
      where: { userId: userId },
      relations: ['course'],
    });
  }
}
