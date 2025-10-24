import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Controller } from './s3.controller';
import { S3Service } from './s3.service';
import { StorachaStorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  controllers: [S3Controller],
  providers: [S3Service, StorachaStorageService],
  exports: [S3Service, StorachaStorageService], // 导出服务，供其他模块使用
})
export class StorageModule {}
