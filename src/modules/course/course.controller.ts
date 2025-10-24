import { Body, Controller, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { CourseService } from './course.service';
import type { CreateCourseDto } from './dto/create-course.dto';
import type { CreateLessonDto } from './dto/create-lesson.dto';
import type { Chapter } from './entities/chapter.entity';
import type { Course } from './entities/course.entity';
import {
  CreateApiDoc,
  createLessonApiDoc,
  findAllApiDoc,
  findOneApiDoc,
  getMyCoursesApiDoc,
  rateDoc,
} from './swagger-doc';
import { CreateChapterDto } from './dto/create-chapter.dto';

@ApiTags('课程管理')
// @UseGuards(JwtAuthGuard)
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('create')
  @CreateApiDoc()
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return await this.courseService.create(createCourseDto);
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

  @Post('list')
  @findAllApiDoc()
  async findAll(
    @Body('page') page = 1,
    @Body('limit') limit = 10,
    @Body('categories') categories?: string[],
    @Body('free') free?: string,
    @Body('priceRange') priceRange?: string[],
    @Body('keyword') keyword?: string
  ): Promise<Course[]> {
    return await this.courseService.findAll({
      categories,
      free,
      priceRange,
      page,
      limit,
      keyword,
    });
  }

  @Get('detail')
  @findOneApiDoc()
  async findOne(@Query('courseId', ParseIntPipe) courseId: number): Promise<Course> {
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

  @Post('chaptersCreate')
  @createLessonApiDoc()
  async createChapter(@Body() createChapterDto: CreateChapterDto): Promise<Chapter> {
    return await this.courseService.createChapter(createChapterDto);
  }

  @Get('chaptersList')
  @getMyCoursesApiDoc()
  async getCourseChapters(@Query('courseId') courseId: number): Promise<Chapter[]> {
    return await this.courseService.getCourseChapters(courseId);
  }

  @Get('chaptersDetail')
  @createLessonApiDoc()
  async getChapter(@Query('chapterId') chapterId: number): Promise<Chapter> {
    return await this.courseService.findOneChapter(chapterId);
  }
}
