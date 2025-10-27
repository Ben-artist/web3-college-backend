import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CompleteMultipartUploadDto,
  CompleteMultipartUploadResponseDto,
  FileType,
  FileUploadResponseDto,
  GeneratePresignedUrlDto,
  GetUploadPartUrlDto,
  GetUploadPartUrlResponseDto,
  InitiateMultipartUploadDto,
  InitiateMultipartUploadResponseDto,
  PresignedUrlResponseDto,
} from './dto/upload.dto';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('文件上传')

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传单个文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '文件上传',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '要上传的文件',
        },
        fileType: {
          type: 'string',
          enum: Object.values(FileType),
          description: '文件类型',
        },
      },
      required: ['file', 'fileType'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '文件上传成功',
    type: FileUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: '文件类型或大小不符合要求' })
  @ApiResponse({ status: 500, description: '文件上传失败' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: FileType
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    if (!fileType) {
      throw new BadRequestException('请指定文件类型');
    }
    return await this.s3Service.uploadFile(file, fileType);
  }

  /**
   * 初始化分片上传
   */
  @Post('multipart/initiate')
  @ApiOperation({ summary: '初始化分片上传（用于大视频文件）' })
  @ApiBody({ type: InitiateMultipartUploadDto })
  @ApiResponse({
    status: 200,
    description: '初始化成功，返回uploadId和key',
    type: InitiateMultipartUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 500, description: '初始化失败' })
  async initiateMultipartUpload(
    @Body() dto: InitiateMultipartUploadDto,
  ): Promise<InitiateMultipartUploadResponseDto> {
    return await this.s3Service.initiateMultipartUpload(dto.fileName, dto.contentType);
  }

  /**
   * 获取分片上传URL
   */
  @Post('multipart/part-url')
  @ApiOperation({ summary: '获取分片上传URL' })
  @ApiBody({ type: GetUploadPartUrlDto })
  @ApiResponse({
    status: 200,
    description: '获取成功，返回预签名URL',
    type: GetUploadPartUrlResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 500, description: '获取失败' })
  async getUploadPartUrl(
    @Body() dto: GetUploadPartUrlDto,
  ): Promise<GetUploadPartUrlResponseDto> {
    return await this.s3Service.getUploadPartUrl(dto.key, dto.uploadId, dto.partNumber);
  }

  /**
   * 完成分片上传
   */
  @Post('multipart/complete')
  @ApiOperation({ summary: '完成分片上传' })
  @ApiBody({ type: CompleteMultipartUploadDto })
  @ApiResponse({
    status: 200,
    description: '上传完成，返回文件URL和时长',
    type: CompleteMultipartUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 500, description: '完成失败' })
  async completeMultipartUpload(
    @Body() dto: CompleteMultipartUploadDto,
  ): Promise<CompleteMultipartUploadResponseDto> {
    return await this.s3Service.completeMultipartUpload(
      dto.key,
      dto.uploadId,
      dto.parts,
      dto.duration,
    );
  }

  /**
   * 取消分片上传
   */
  @Post('multipart/abort')
  @ApiOperation({ summary: '取消分片上传' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string', example: 'videos/video-123.mp4' },
        uploadId: { type: 'string', example: 'upload-123-abc' },
      },
      required: ['key', 'uploadId'],
    },
  })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 500, description: '取消失败' })
  async abortMultipartUpload(
    @Body('key') key: string,
    @Body('uploadId') uploadId: string,
  ): Promise<{ message: string }> {
    await this.s3Service.abortMultipartUpload(key, uploadId);
    return { message: '分片上传已取消' };
  }
}
