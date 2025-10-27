import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Chapter } from './entities/chapter.entity';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';
import { Course } from '../course/entities/course.entity';

/**
 * 章节模块
 * 管理章节相关的功能
 */
@Module({
  imports: [TypeOrmModule.forFeature([Chapter, User, Course])],
  controllers: [ChapterController],
  providers: [ChapterService],
  exports: [ChapterService], // 导出服务，供其他模块使用
})
export class ChapterModule {}
