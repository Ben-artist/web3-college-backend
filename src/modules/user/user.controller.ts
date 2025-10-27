import { Body, Controller, Get, Post, UseGuards, Param, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import type { Response } from 'express';

import { UserId } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { UserCourseProgress } from '../course/entities/user-course-progress.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { User as UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

/**
 * 用户控制器
 * 处理用户相关的HTTP请求
 */
@ApiTags('用户管理')

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // 检查用户是否存在
  @Public()
  @Post('check')
  @ApiOperation({ summary: '检查用户是否存在' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: '钱包地址',
          example: '0x1234567890abcdef1234567890abcdef12345678',
        },
      },
      required: ['walletAddress'],
    },
  })
  @ApiResponse({ status: 200, description: '检查成功' })
  async checkUserExists(@Body() checkUserExistsDto: { walletAddress: string }): Promise<{ exists: boolean }> {
    const user = await this.userService.findByWalletAddress(checkUserExistsDto.walletAddress);
    return { exists: !!user };
  }


  // 用户登录
  @Public()
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: '用户钱包地址',
          example: '0x1234567890abcdef1234567890abcdef12345678',
        },
        signature: {
          type: 'string',
          description: '签名',
          example: '0x...',
        },
        message: {
          type: 'string',
          description: '签名消息',
          example: 'Web3 College Login...',
        },
      },
    },
    required: true,
  })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 400, description: '登录失败' })
  async login(
    @Body() loginData: { walletAddress: string; signature: string; message: string },
    @Res({ passthrough: true }) res: Response
  ): Promise<{ user: UserEntity; token: string }> {
    const { user, token } = await this.userService.login(loginData);

    // 设置 HttpOnly Cookie 保存 token
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProd, // 生产环境使用 HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
      path: '/',
    });

    return { user, token };
  }

  // 登出，清除 Cookie
  @Public()
  @Post('logout')
  @ApiOperation({ summary: '用户登出（清除认证Cookie）' })
  @ApiResponse({ status: 200, description: '登出成功' })
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ success: boolean }>{
    res.clearCookie('auth_token', { path: '/' });
    return { success: true };
  }

  // 注册为讲师  
  @Post('registerAsInstructor')
  @ApiOperation({ summary: '注册为讲师' })
  registerAsInstructor(
    @Body() registerUserDto: RegisterUserDto,
    @UserId() userId: number
  ): Promise<UserEntity | null> {
    return this.userService.registerAsInstructor(registerUserDto, userId);
  }

  // 获取用户
  @Get('profile')
  @ApiOperation({ summary: '获取用户信息' })
  @ApiResponse({ status: 200, description: '获取用户成功' })
  @ApiResponse({ status: 500, description: '用户不存在' })
  getProfile(@UserId() userId: number): Promise<UserEntity | null> {
    return this.userService.getUserById(userId);
  }

  // 用户购买过的课程
  @Get('purchasedCourses')
  @ApiOperation({ summary: '用户购买过的课程' })
  @ApiResponse({ status: 200, description: '购买成功' })
  @ApiResponse({ status: 400, description: '购买失败' })
  purchaseCourse(@UserId() userId: number): Promise<UserCourseProgress[]> {
    return this.userService.getUserPurchasedCourses(userId);
  }

  // 获取用户已完成的课程
  @Get('completedCourses')
  @ApiOperation({ summary: '获取用户已完成的课程' })
  @ApiResponse({ status: 200, description: '获取成功' })
  completedCourses(@UserId() userId: number): Promise<UserCourseProgress[]> {
    return this.userService.getUserCompletedCoursesByUserId(userId);
  }

  // 更新用户资料
  @Post('updateProfile')
  @ApiOperation({ summary: '更新用户资料' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '更新失败' })
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @UserId() userId: number
  ): Promise<UserEntity> {
    return this.userService.updateProfile(updateProfileDto, userId);
  }

  // 获取用户自己创建的课程
  @Get('createdCourses')
  @ApiOperation({ summary: '获取用户自己创建的课程' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCreatedCourses(@UserId() userId: number): Promise<any[]> {
    return this.userService.getUserCreatedCourses(userId);
  }

  // 获取用户统计信息
  @Get('stats')
  @ApiOperation({ summary: '获取用户统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserStats(@UserId() userId: number): Promise<{
    totalCourses: number;
    completedCourses: number;
    certificates: number;
    totalLearningTime: number;
  }> {
    return this.userService.getUserStats(userId);
  }

  // 获取用户收藏的课程
  @Get('favorites')
  @ApiOperation({ summary: '获取用户收藏的课程' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getFavoriteCourses(@UserId() userId: number): Promise<any[]> {
    return this.userService.getUserFavoriteCourses(userId);
  }

  // 获取用户购买的课程
  @Get('purchases')
  @ApiOperation({ summary: '获取用户购买的课程' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPurchasedCourses(@UserId() userId: number): Promise<any[]> {
    return this.userService.getUserPurchasedCourses(userId);
  }

  // 获取用户学习进度
  @Get('progress')
  @ApiOperation({ summary: '获取用户学习进度' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getLearningProgress(@UserId() userId: number): Promise<any[]> {
    return this.userService.getUserLearningProgress(userId);
  }
}
