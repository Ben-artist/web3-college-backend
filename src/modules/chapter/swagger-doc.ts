import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { Chapter } from './entities/chapter.entity';
import { Course } from '../course/entities/course.entity';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

export function findAllApiDoc() {
  return applyDecorators(ApiOperation({ summary: '获取课程列表' }));
}

export function findOneApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: '根据ID获取课程详情' }),
    ApiResponse({ status: 200, description: '获取课程详情成功', type: Course }),
    ApiResponse({ status: 404, description: '课程不存在' })
  );
}

export function createChapterApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: '为课程创建章节' }),
    ApiBody({
      description: '创建章节请求体',
      type: CreateChapterDto,
    }),
    ApiResponse({ status: 201, description: '章节创建成功', type: Chapter }),
    ApiResponse({ status: 404, description: '课程不存在' })
  );
}

export function updateChapterApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: '更新章节' }),
    ApiBody({
      description: '更新章节请求体',
      type: UpdateChapterDto,
    }),
    ApiResponse({ status: 200, description: '章节更新成功', type: Chapter }),
  );
}

export function deleteChapterApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: '删除章节' }),
    ApiBody({
      description: '删除章节请求体',
      schema: {
        type: 'object',
        properties: {
          chapterId: { type: 'number', description: '章节ID' },
        },
      },
    }),
    ApiResponse({ status: 200, description: '章节删除成功' }),
    ApiResponse({ status: 404, description: '章节不存在' })
  );
}

export function getChapterDetailApiDoc() {
  return applyDecorators(
    ApiOperation({ summary: '获取章节详情' }),
    ApiResponse({
      status: 200,
      description: '获取章节详情成功',
      type: Chapter,
    }),
    ApiResponse({ status: 404, description: '章节不存在' })
  );
}
