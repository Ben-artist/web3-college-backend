import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  FileType,
  FileUploadResponseDto,
  GeneratePresignedUrlDto,
  PresignedUrlResponseDto,
} from './dto/upload.dto';
import { S3Service } from './s3.service';

@ApiTags('文件存储')
@Controller('storage')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
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

    return await this.s3Service.uploadFile(file);
  }
}
