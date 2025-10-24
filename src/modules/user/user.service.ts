import { Injectable, NotFoundException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';
import { UserCourseProgress } from '../course/entities/user-course-progress.entity';
import type { RegisterUserDto } from './dto/register-user.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';

/**
 * 用户服务�? * 处理用户相关的业务逻辑（使用模拟数据）
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
    private jwtService: JwtService
  ) {}

  /**
   * 根据钱包地址获取用户
   */
  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { walletAddress },
    });
  }

  /**
   * 根据钱包地址登录，如果用户不存在，则创建用户，并返回用户信息和JWT token
   */
  async login(walletAddress: string): Promise<{
    user: User;
    token: string;
  }> {
    let user = await this.findByWalletAddress(walletAddress);
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
      avatarUrl: user.avatarUrl,
    };

    const token = this.jwtService.sign(payload);
    return { user, token };
  }

  async registerAsInstructor(
    registerUserDto: RegisterUserDto,
    userId: number
  ): Promise<User | null> {
    // �?token 中取得用户信�?    const { username, email, isInstructorRegistered, avatarUrl, bio, specializations } =
      registerUserDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`用户 ${userId} 不存在`);
    }
    // 更新用户信息
    user.username = username || user.username;
    user.email = email || user.email;
    user.isInstructorRegistered = isInstructorRegistered || user.isInstructorRegistered;
    user.avatarUrl = avatarUrl || user.avatarUrl;
    user.bio = bio || user.bio;
    user.specializations = specializations || user.specializations;
    await this.userRepository.save(user);
    return user;
  }

  getUserById(userId: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  /**
   * 获取用户购买的课�?   */
  async getUserPurchasedCourses(userId: number): Promise<UserCourseProgress[]> {
    return await this.userCourseProgressRepository.find({
      where: { userId: userId, isPaid: true },
      relations: ['course'],
    });
  }

  // 用户已经完成的课�?  async getUserCompletedCoursesByUserId(userId: number): Promise<UserCourseProgress[]> {
    return await this.userCourseProgressRepository.find({
      where: { userId: userId, isPaid: true, isCompleted: true },
      relations: ['course'],
    });
  }

  /**
   * 更新用户资料
   */
  async updateProfile(updateProfileDto: UpdateProfileDto, userId: number): Promise<User> {
    const { username, email, avatarUrl, bio, specializations } = updateProfileDto;

    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`用户 ${userId} 不存在`);
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.avatarUrl = avatarUrl || user.avatarUrl;
    user.bio = bio || user.bio;
    user.specializations = specializations || user.specializations;

    return await this.userRepository.save(user);
  }
}
