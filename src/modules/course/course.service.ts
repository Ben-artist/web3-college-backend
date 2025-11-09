import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, type Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import type { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './entities/course.entity';
import { UserCourseProgress } from './entities/user-course-progress.entity';
import { UserCoursePurchase } from './entities/user-course-purchase.entity';
import { UserCourseFavorite } from './entities/user-course-favorite.entity';
import { Chapter } from '../chapter/entities/chapter.entity';
import { COURSE_STATUS } from 'src/config/constant';
import { SearchCourseDto } from './dto/search-course.dto';
@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
    @InjectRepository(UserCourseProgress)
    private userCourseProgressRepository: Repository<UserCourseProgress>,
    @InjectRepository(UserCoursePurchase)
    private userCoursePurchaseRepository: Repository<UserCoursePurchase>,
    @InjectRepository(UserCourseFavorite)
    private userCourseFavoriteRepository: Repository<UserCourseFavorite>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) { }

  /**
   * 创建课程（需要验证用户身份和权限）
   */
  async create(createCourseDto: CreateCourseDto, user: User): Promise<
    Course | { success: boolean, message: string, data: null }> {
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
  async findAll(searchCourseDto: SearchCourseDto, user?: User): Promise<any[]> {
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
    if (searchCourseDto.categories && searchCourseDto.categories?.length > 0) {
      // 使用 PostgreSQL 的 @> 操作符检查 JSON 数组是否包含任意一个分类
      // 对于多个分类，检查是否包含其中任意一个
      const categoryConditions =
        searchCourseDto.categories && searchCourseDto.categories.length > 0
          ? searchCourseDto.categories
            .map((_, index) => `course.categories::jsonb @> :category${index}::jsonb`)
            .join(' OR ')
          : '';
      queryBuilder.andWhere(`(${categoryConditions})`, {
        ...searchCourseDto.categories?.reduce(
          (acc, category, index) => {
            acc[`category${index}`] = JSON.stringify([category]);
            return acc;
          },
          {} as Record<string, string>
        ),
      });
    }

    // 难度筛选
    if (searchCourseDto.difficulty) {
      queryBuilder.andWhere('course.difficulty = :difficulty', { difficulty: searchCourseDto.difficulty });
    }

    // 免费/付费筛选
    if (searchCourseDto.isFree) {
      queryBuilder.andWhere('course.isFree = :isFree', { isFree: searchCourseDto.isFree });
    }

    // 价格范围筛选
    if (searchCourseDto.sortByPrice) {
      queryBuilder.orderBy('course.price', searchCourseDto.sortByPrice);
    }

    // 评分排序
    if (searchCourseDto.sortByRating) {
      queryBuilder.orderBy('course.rating', searchCourseDto.sortByRating);
    }

    // 日期排序
    if (searchCourseDto.sortByDate) {
      queryBuilder.orderBy('course.createdAt', searchCourseDto.sortByDate);
    }
    // 关键词搜索
    if (searchCourseDto.keyword) {
      queryBuilder.andWhere('course.title LIKE :keyword', {
        keyword: `%${searchCourseDto.keyword}%`,
      });
    }
    const courses = await queryBuilder.getMany();
    
    // 如果用户已登录，查询并设置每个课程的 isFavorited 字段
    if (user) {
      const courseFavorites = await this.userCourseFavoriteRepository.find({
        where: { userId: user.id },
        select: ['courseId'],
      });
      const favoritedCourseIds = new Set(courseFavorites.map(fav => fav.courseId));
      
      courses.forEach((course: any) => {
        course.isFavorited = favoritedCourseIds.has(course.courseId);
      });
    } else {
      // 如果用户未登录，所有课程的 isFavorited 都为 false
      courses.forEach((course: any) => {
        course.isFavorited = false;
      });
    }
    
    return courses;
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

  /**
   * 发布课程
   * @param courseId 课程ID
   * @param user 当前用户
   */
  async publishCourse(courseId: number, user: User): Promise<Course> {
    // 查找课程
    const course = await this.courseRepository.findOne({
      where: { courseId },
      relations: ['chapters'],
    });

    if (!course) {
      throw new NotFoundException(`课程ID ${courseId} 不存在`);
    }

    // 验证用户是否是课程的创建者
    if (course.instructorId !== user.id) {
      throw new ForbiddenException('只有课程的创建者才能发布该课程');
    }

    // 验证课程状态（只有草稿或待审核状态的课程才能发布）
    if (course.courseStatus === COURSE_STATUS.PUBLISHED) {
      throw new BadRequestException('课程已经发布，无需重复发布');
    }

    if (course.courseStatus === COURSE_STATUS.REJECTED) {
      throw new BadRequestException('被拒绝的课程无法发布，请先修改课程内容');
    }

    // 验证课程是否有章节（发布前至少需要有一个章节）
    const chapters = await this.chapterRepository.find({
      where: { course: { courseId } },
    });

    if (!chapters || chapters.length === 0) {
      throw new BadRequestException('课程至少需要有一个章节才能发布');
    }

    // 更新课程状态为已发布
    course.courseStatus = COURSE_STATUS.PUBLISHED;

    // 保存更新后的课程
    return await this.courseRepository.save(course);
  }

  /**
   * 创建购买记录（第一步：先在后端创建pending状态的记录）
   * @param courseId 课程ID
   * @param user 当前用户
   */
  async createPurchaseRecord(courseId: number, user: User): Promise<UserCoursePurchase> {
    // 验证课程是否存在
    const course = await this.courseRepository.findOne({
      where: { courseId },
    });

    if (!course) {
      throw new NotFoundException(`课程ID ${courseId} 不存在`);
    }

    // 检查用户是否已经购买过该课程
    const existingPurchase = await this.userCoursePurchaseRepository.findOne({
      where: { userId: user.id, courseId },
    });

    if (existingPurchase) {
      // 如果已经存在购买记录，检查状态
      if (existingPurchase.status === 'confirmed') {
        throw new BadRequestException('您已经购买过该课程');
      }
      // 如果是 pending 状态，返回现有记录
      if (existingPurchase.status === 'pending') {
        return existingPurchase;
      }
    }

    // 检查课程是否免费
    if (course.price === 0 || Number(course.price) === 0) {
      throw new BadRequestException('免费课程无需购买，可直接学习');
    }

    // 创建新的购买记录
    const purchase = this.userCoursePurchaseRepository.create({
      userId: user.id,
      courseId,
      amount: course.price.toString(),
      status: 'pending', // 初始状态为 pending，等待链上交易确认
    });

    return await this.userCoursePurchaseRepository.save(purchase);
  }

  /**
   * 收藏或取消收藏课程
   * @param courseId 课程ID
   * @param user 当前用户
   * @param action 操作类型：'favorite' 收藏 或 'unfavorite' 取消收藏
   */
  async toggleFavorite(courseId: number, user: User, action: 'favorite' | 'unfavorite'): Promise<void> {
    // 验证课程是否存在
    const course = await this.courseRepository.findOne({
      where: { courseId },
    });

    if (!course) {
      throw new NotFoundException(`课程ID ${courseId} 不存在`);
    }

    // 查找是否已经收藏
    const existingFavorite = await this.userCourseFavoriteRepository.findOne({
      where: { userId: user.id, courseId },
    });

    if (action === 'favorite') {
      // 收藏操作
      if (existingFavorite) {
        // 已经收藏过了，直接返回成功
        return;
      }

      // 创建收藏记录
      const favorite = this.userCourseFavoriteRepository.create({
        userId: user.id,
        courseId,
      });

      await this.userCourseFavoriteRepository.save(favorite);
    } else if (action === 'unfavorite') {
      // 取消收藏操作
      if (!existingFavorite) {
        // 没有收藏记录，直接返回成功
        return;
      }

      // 删除收藏记录
      await this.userCourseFavoriteRepository.remove(existingFavorite);
    } else {
      throw new BadRequestException(`无效的操作类型: ${action}，必须是 'favorite' 或 'unfavorite'`);
    }
  }
}
