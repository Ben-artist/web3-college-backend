import { Body, Controller, Get, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import type { Course } from './entities/course.entity';
import {
  CreateApiDoc,
  createLessonApiDoc,
  findAllApiDoc,
  findOneApiDoc,
  getMyCoursesApiDoc,
  rateDoc,
} from './swagger-doc';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SearchCourseDto } from './dto/search-course.dto';
import { Public } from 'src/common/decorators/public.decorator';
@ApiTags('课程管理')
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @Post('create')
  @CreateApiDoc()
  async create(@Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: User
  ):Promise<Course | {success:boolean,message:string,data:null}> {
    return await this.courseService.create(createCourseDto, user);
  }

  @Get('my')
  @getMyCoursesApiDoc()
  async getMyCourses(
    @Query('walletAddress') walletAddress: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ): Promise<Course[]> {
    return await this.courseService.getUserCourses(walletAddress, page, limit);
  }

  // 价格排序
  // 评分排序
  // 日期排序
  // 关键词搜索
  // 课程列表接口设置为公共接口，允许未登录用户浏览课程
  @Public()
  @Post('list')
  @findAllApiDoc()
  async findAll( @Body() searchCourseDto: SearchCourseDto,
    @CurrentUser() user: User | undefined
  ): Promise<Course[]> {
    return await this.courseService.findAll(searchCourseDto, user);
  }

  // 课程详情接口设置为公共接口，允许未登录用户查看
  @Public()
  @Get('detail')
  @findOneApiDoc()
  async findOne(@Query('courseId', ParseIntPipe) courseId: number): Promise<{ course: Course, instructor: User }> {
    return await this.courseService.findOne(courseId);
  }

  @Post('rate')
  @rateDoc()
  async rate(
    @Body('courseId') courseId: number,
    @Body('walletAddress') walletAddress: string,
    @Body('rating') rating: number
  ): Promise<Course> {
    return await this.courseService.updateRating(courseId, walletAddress, rating);
  }

  // 发布课程
  @Post('publish')
  @ApiOperation({ summary: '发布课程' })
  @ApiResponse({ status: 200, description: '发布成功' })
  @ApiResponse({ status: 400, description: '发布失败' })
  @ApiResponse({ status: 403, description: '无权限发布该课程' })
  async publishCourse(
    @Query('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: User
  ): Promise<Course> {
    return await this.courseService.publishCourse(courseId, user);
  }

  // 创建购买记录（第一步：先在后端创建pending状态的记录）
  @Post('purchase/create')
  @ApiOperation({ summary: '创建购买记录' })
  @ApiResponse({ status: 200, description: '创建成功' })
  @ApiResponse({ status: 400, description: '创建失败' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async createPurchaseRecord(
    @Query('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: User
  ) {
    return await this.courseService.createPurchaseRecord(courseId, user);
  }

  // 收藏或取消收藏课程
  @Post('favorite')
  @ApiOperation({ summary: '收藏或取消收藏课程' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @ApiResponse({ status: 400, description: '操作失败' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  async favoriteCourse(
    @Body('courseId') courseId: number,
    @Body('action') action: 'favorite' | 'unfavorite',
    @CurrentUser() user: User
  ): Promise<{ success: boolean; message: string }> {
    await this.courseService.toggleFavorite(courseId, user, action);
    return {
      success: true,
      message: action === 'favorite' ? '收藏成功' : '取消收藏成功',
    };
  }
}
