import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Chapter } from './entities/chapter.entity';
import {
  createChapterApiDoc,
  deleteChapterApiDoc,
  findAllApiDoc,
  findOneApiDoc,
  updateChapterApiDoc,
} from './swagger-doc';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ChapterService } from './chapter.service';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { UserChapterProgress } from './entities/user-chapter-progress.entity';
@ApiTags('课程管理')
@UseGuards(JwtAuthGuard)
@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) { }


  @Post('create')
  @createChapterApiDoc()
  async createChapter(@Body() createChapterDto: CreateChapterDto): Promise<Chapter> {
    return await this.chapterService.createChapter(createChapterDto);
  }

  @Post('update')
  @updateChapterApiDoc()
  async updateChapter(@Body() updateChapterDto: UpdateChapterDto): Promise<Chapter> {
    return await this.chapterService.updateChapter(updateChapterDto);
  }

  @Get('list')
  @findAllApiDoc()
  async getChapterList(@Query('courseId') courseId: number): Promise<Chapter[]> {
    return await this.chapterService.getChapterList(courseId);
  }

  // 删除
  @Post('delete')
  @deleteChapterApiDoc()
  async deleteChapter(@Body() deleteChapterDto: { chapterId: number }): Promise<boolean> {
    return await this.chapterService.deleteChapter(deleteChapterDto.chapterId);
  }

  @Get('detail')
  @findOneApiDoc()
  async getChapter(@Query('chapterId') chapterId: number): Promise<Chapter> {
    return await this.chapterService.getChapterDetail(chapterId);
  }

  // 获取用户的观看历史记录
  @Get('watch-history')
  @ApiOperation({ summary: '获取用户的观看历史记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWatchHistory(
    @UserId() userId: number,
    @Query('limit') limit?: number
  ): Promise<UserChapterProgress[]> {
    const limitNum = limit ? parseInt(limit.toString(), 10) : 20;
    return await this.chapterService.getWatchHistory(userId, limitNum);
  }
}
