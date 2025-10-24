import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserId } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { UserCourseProgress } from '../course/entities/user-course-progress.entity';
import type { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { User as UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

/**
 * 用户控制器
 * 处理用户相关的HTTP请求
 */
@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 登录
  @Public()
  @Post('login')
  @ApiOperation({ summary: '登录' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: '用户钱包地址',
          example: '0x1234567890abcdef1234567890abcdef12345678',
        },
      },
    },
    required: true,
  })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 400, description: '登录失败' })
  login(
    @Body('walletAddress') walletAddress: string
  ): Promise<{ user: UserEntity; token: string }> {
    return this.userService.login(walletAddress);
  }

  // 注册为讲师  @Post('registerAsInstructor')
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
}
