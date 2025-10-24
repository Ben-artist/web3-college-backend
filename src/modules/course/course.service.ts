import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, type Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import type { CreateCourseDto } from './dto/create-course.dto';
import type { CreateLessonDto } from './dto/create-lesson.dto';
import { Chapter } from './entities/chapter.entity';
import { Course } from './entities/course.entity';
import { UserCourseProgress } from './entities/user-course-progress.entity';
import { plainToClassFromExist } from 'class-transformer';
import { CreateChapterDto } from './dto/create-chapter.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
    @InjectRepository(UserCourseProgress)
    private userCourseProgressRepository: Repository<UserCourseProgress>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  /**
   * 创建课程（需要验证用户身份和权限）
   */
  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    // 验证用户是否存在
    const user = await this.userRepository.findOne({
      where: { walletAddress: createCourseDto.walletAddress },
    });

    if (!user) {
      throw new NotFoundException(`用户钱包地址 ${createCourseDto.walletAddress} 不存在`);
    }

    // 验证讲师是否已注册和审核通过
    if (!user.isInstructorRegistered || !user.isInstructorApproved) {
      throw new ForbiddenException('讲师需要先注册并通过审核才能创建课程');
    }
    const course = new Course();
    const courseData = plainToClassFromExist(course, createCourseDto);
    course.instructor = user;
    const savedCourse = await this.courseRepository.save(courseData);
    return savedCourse;
  }

  /**
   * 获取用户创建的课程
   */
  async getUserCourses(walletAddress: string, page = 1, limit = 10): Promise<any[]> {
    // 验证用户是否存在
    const user = await this.userRepository.findOne({
      where: { walletAddress },
    });

    if (!user) {
      throw new NotFoundException(`用户钱包地址 ${walletAddress} 不存在`);
    }

    const courses = await this.courseRepository.find({
      where: { instructorWallet: user.walletAddress },
      order: { createdAt: 'DESC' },
      relations: ['lessons', 'userProgresses'], // 包含关联数据以支持动态计算
      skip: (page - 1) * limit,
      take: limit,
    });
    return courses;
  }

  /**
   * 获取所有课程
   */
  async findAll({
    page,
    limit,
    free,
    priceRange,
    keyword,
    categories,
  }: {
    page: number;
    limit: number;
    categories?: string[];
    free?: string;
    priceRange?: string[];
    keyword?: string;
  }): Promise<any[]> {
    // 构建查询条件
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.lessons', 'lessons')
      .leftJoinAndSelect('course.userProgresses', 'userProgresses')
      .orderBy('course.createdAt', 'DESC');

    // 分类筛选 - 使用 JSON 包含操作符
    if (categories && categories?.length > 0) {
      // 使用 PostgreSQL 的 @> 操作符检查 JSON 数组是否包含任意一个分类
      // 对于多个分类，检查是否包含其中任意一个
      const categoryConditions =
        categories && categories.length > 0
          ? categories
              .map((_, index) => `course.categories::jsonb @> :category${index}::jsonb`)
              .join(' OR ')
          : '';
      queryBuilder.andWhere(`(${categoryConditions})`, {
        ...categories?.reduce(
          (acc, category, index) => {
            acc[`category${index}`] = JSON.stringify([category]);
            return acc;
          },
          {} as Record<string, string>
        ),
      });
    }

    // 免费/付费筛选
    if (free !== undefined) {
      queryBuilder.andWhere('course.isFree = :isFree', { isFree: free });
    }

    // 价格范围筛选
    if (priceRange?.length === 2) {
      queryBuilder.andWhere('course.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      });
    }

    // 关键词搜索
    if (keyword) {
      queryBuilder.andWhere('course.title LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    // 分页
    queryBuilder.skip((page - 1) * limit).take(limit);

    const courses = await queryBuilder.getMany();

    // 手动添加计算字段，确保 getter 方法的值被包含在返回结果中
    return courses;
  }

  /**
   * 根据ID获取课程
   */
  async findOne(courseId: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { courseId: courseId },
      relations: ['lessons', 'userProgresses'], // 包含关联数据以支持动态计算
    });
    if (!course) {
      throw new NotFoundException(`课程ID ${courseId} 不存在`);
    }
    return course;
  }

  /**
   * 更新课程评分（需要验证用户是否购买过课程）
   */
  async updateRating(courseId: number, walletAddress: string, rating: number): Promise<Course> {
    // 验证课程是否存在
    const course = await this.findOne(courseId);
    // 验证用户是否存在
    const user = await this.userRepository.findOne({
      where: { walletAddress },
    });
    if (!user) {
      throw new NotFoundException(`用户钱包地址 ${walletAddress} 不存在`);
    }
    // 验证用户是否购买过该课程
    const userProgress = await this.userCourseProgressRepository.findOne({
      where: { userId: user.id, courseId: courseId, isPaid: true },
    });

    if (!userProgress) {
      throw new ForbiddenException('只有购买过该课程的用户才能评分');
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      throw new ForbiddenException('评分必须在1-5之间');
    }

    // 更新用户评分记录（允许修改评分）
    userProgress.userRating = rating;
    userProgress.ratedAt = new Date();
    await this.userCourseProgressRepository.save(userProgress);

    // 计算课程平均评分
    const allRatings = await this.userCourseProgressRepository.find({
      where: { courseId: courseId, userRating: Not(IsNull()) },
      select: ['userRating'],
    });

    const totalRating = allRatings.reduce((sum, progress) => sum + (progress.userRating || 0), 0);
    const averageRating = allRatings.length > 0 ? totalRating / allRatings.length : 0;

    // 更新课程评分
    course.rating = Math.round(averageRating * 100) / 100; // 保留两位小数
    // reviewCount 现在通过 getter 方法动态计算，无需手动更新

    return await this.courseRepository.save(course);
  }

  /**
   * 创建章节
   */
  async createChapter(createChapterDto: CreateChapterDto): Promise<Chapter> {
    // 验证课程是否存在
    const course = await this.findOne(createChapterDto.courseId);
    const chapter = new Chapter();
    const chapterData = plainToClassFromExist(chapter, createChapterDto);
    chapter.course = course;
    const savedChapter = await this.chapterRepository.save(chapterData);
    return savedChapter;
  }

  /**
   * 获取课程的所有章节
   */
  async getCourseChapters(courseId: number): Promise<Chapter[]> {
    await this.findOne(courseId); // 验证课程存在
    return await this.chapterRepository.find({
      where: { course: { courseId } },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOneChapter(chapterId: number): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      where: { chapterId },
    });
    if (!chapter) {
      throw new NotFoundException(`章节ID ${chapterId} 不存在`);
    }
    return chapter;
  }
}
