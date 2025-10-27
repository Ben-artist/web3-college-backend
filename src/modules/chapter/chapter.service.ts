import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, type Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Chapter } from './entities/chapter.entity';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { Course } from '../course/entities/course.entity';
import { UpdateChapterDto } from './dto/update-chapter.dto';
@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) { }


  async getChapterList(courseId: number): Promise<Chapter[]> {
    return await this.chapterRepository.find({
      where: { course: { courseId } },
      order: { orderSequence: 'ASC' },
    });
  }

  /**
   * 创建章节
   */
  async createChapter(createChapterDto: CreateChapterDto): Promise<Chapter> {
    // 验证课程是否存在
    const course = await this.courseRepository.findOne({
      where: { courseId: createChapterDto.courseId },
    });
    if (!course) {
      throw new NotFoundException(`课程ID ${createChapterDto.courseId} 不存在`);
    }
    const chapter = new Chapter();
    Object.assign(chapter, createChapterDto);
    chapter.course = course;
    const savedChapter = await this.chapterRepository.save(chapter);
    return savedChapter;
  }

  async updateChapter(updateChapterDto: UpdateChapterDto): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      where: { chapterId: updateChapterDto.chapterId },
    });
    if (!chapter) {
      throw new NotFoundException(`章节ID ${updateChapterDto.chapterId} 不存在`);
    }
    Object.assign(chapter, updateChapterDto);
    return await this.chapterRepository.save(chapter);
  }

  async deleteChapter(chapterId: number): Promise<boolean> {
    const chapter = await this.chapterRepository.findOne({
      where: { chapterId },
    });
    if (!chapter) {
      throw new NotFoundException(`章节ID ${chapterId} 不存在`);
    }
   
   const r =  await this.chapterRepository.softDelete(chapterId);
    return r.affected && r.affected > 0 ? true : false;
  }

  async getChapterDetail(chapterId: number): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      where: { chapterId },
    });
    if (!chapter) {
      throw new NotFoundException(`章节ID ${chapterId} 不存在`);
    }
    return chapter;
  }
}
