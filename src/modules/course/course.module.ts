import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Chapter } from './entities/chapter.entity';
import { Course } from './entities/course.entity';
import { UserCourseProgress } from './entities/user-course-progress.entity';

/**
 * 课程模块
 * 管理课程和章节相关的功能
 */
@Module({
  imports: [TypeOrmModule.forFeature([Course, Chapter, UserCourseProgress, User])],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService], // 导出服务，供其他模块使用
})
export class CourseModule {}
