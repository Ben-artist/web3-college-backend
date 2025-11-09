import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { UserCourseProgress } from '../course/entities/user-course-progress.entity';
import { UserCourseFavorite } from '../course/entities/user-course-favorite.entity';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

/**
 * 用户模块
 * 管理用户相关的功能（包括学生和讲师）
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserCourseProgress, Course, UserCourseFavorite]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // 导出服务，供其他模块使用
})
export class UserModule {}
