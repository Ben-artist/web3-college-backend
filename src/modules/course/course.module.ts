import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course } from './entities/course.entity';
import { UserCourseProgress } from './entities/user-course-progress.entity';
import { Chapter } from '../chapter/entities/chapter.entity';

/**
 * 课程模块
 * 管理课程功能
 */
@Module({
  imports: [TypeOrmModule.forFeature([Course, UserCourseProgress, User, Chapter])],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService], // 导出服务，供其他模块使用
})
export class CourseModule {}
