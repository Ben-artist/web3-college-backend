import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, type Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import type { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './entities/course.entity';
import { UserCourseProgress } from './entities/user-course-progress.entity';
import { Chapter } from '../chapter/entities/chapter.entity';
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
  ) { }

  /**
   * 创建课程（需要验证用户身份和权限）
   */
  async create(createCourseDto: CreateCourseDto, user: User): Promise<
  Course | {success:boolean,message:string,data:null}  > {
    console.log('user', user)
    console.log('user.isInstructorRegistered', user.isInstructorRegistered)
    console.log('user.isInstructorApproved', user.isInstructorApproved)
    // 验证讲师已注册并审核通过
    if (!(user.isInstructorRegistered && user.isInstructorApproved)) {
      return {
        success: false,
        message: '讲师需要先注册并通过审核才能创建课程2',
        data: null,
      };
    }
    const course = new Course();
    Object.assign(course, createCourseDto);

    // 设置额外的字段
    course.price = parseFloat(createCourseDto.price || '0') || 0;
    course.instructorId = user.id;
    course.instructorWalletAddress = user.walletAddress;

    try {
      const savedCourse = await this.courseRepository.save(course);
      return savedCourse;
    } catch (error) {
      throw error;
    }
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
      where: { instructorWalletAddress: user.walletAddress },
      order: { createdAt: 'DESC' },
      relations: ['chapters', 'instructor'], // 包含关联数据以支持动态计算
      skip: (page - 1) * limit,
      take: limit,
    });
    return courses;
  }

  /**
   * 获取所有课程
   */
  async findAll({
    isFree,
    sortByPrice,
    sortByRating,
    sortByDate,
    keyword,
    categories,
    difficulty,
  }: {
    categories?: string[];
    difficulty?: string;
    isFree?: boolean;
    sortByPrice?: 'ASC' | 'DESC';
    sortByRating?: 'ASC' | 'DESC';
    sortByDate?: 'ASC' | 'DESC';
    keyword?: string;
  }): Promise<any[]> {
    // 构建查询条件，使用子查询计算学生数量
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.chapters', 'chapters')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .loadRelationCountAndMap(
        'course.studentCount',
        'course.userCourseProgresses',
        'progress',
        (qb) => qb.where('progress.isPaid = :isPaid', { isPaid: true })
      )
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

    // 难度筛选
    if (difficulty) {
      queryBuilder.andWhere('course.difficulty = :difficulty', { difficulty });
    }

    // 免费/付费筛选
    if (isFree) {
      queryBuilder.andWhere('course.isFree = :isFree', { isFree: isFree });
    }

    // 价格范围筛选
    if (sortByPrice) {
      queryBuilder.orderBy('course.price', sortByPrice);
    }

    // 评分排序
    if (sortByRating) {
      queryBuilder.orderBy('course.rating', sortByRating);
    }

    // 日期排序
    if (sortByDate) {
      queryBuilder.orderBy('course.createdAt', sortByDate);
    }
    // 关键词搜索
    if (keyword) {
      queryBuilder.andWhere('course.title LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }
    // loadRelationCountAndMap 会自动将计数映射到 course.studentCount
    return await queryBuilder.getMany();
  }

  /**
   * 根据ID获取课程
   */
  async findOne(courseId: number): Promise<{ course: Course, instructor: User }> {
    const course = await this.courseRepository.findOne({
      where: { courseId: courseId },
      relations: ['chapters', 'instructor'], // 包含关联数据以支持动态计算
    });
    if (!course) {
      throw new NotFoundException(`课程ID ${courseId} 不存在`);
    }
    // 找到课程对应的老师
    const instructor = await this.userRepository.findOne({
      where: { id: course.instructorId },
    });
    if (!instructor) {
      throw new NotFoundException(`老师ID ${course.instructorId} 不存在`);
    }
    return { course, instructor };
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
    course.course.rating = Math.round(averageRating * 100) / 100; // 保留两位小数
    // reviewCount 现在通过 getter 方法动态计算，无需手动更新

    return await this.courseRepository.save(course);
  }
}
