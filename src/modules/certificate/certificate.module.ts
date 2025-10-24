import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { StorageModule } from '../storage/storage.module';
import { User } from '../user/entities/user.entity';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { NFTCertificate } from './entities/nft-certificate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NFTCertificate, Course, User]), StorageModule],
  controllers: [CertificateController],
  providers: [CertificateService],
  exports: [CertificateService],
})
export class CertificateModule {}
