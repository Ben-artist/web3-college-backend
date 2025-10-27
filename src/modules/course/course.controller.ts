import { Body, Controller, Get, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  @Post('list')
  @findAllApiDoc()
  async findAll( @Body() searchCourseDto: SearchCourseDto
  ): Promise<Course[]> {
    return await this.courseService.findAll(searchCourseDto);
  }

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
}
