import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CertificateService } from './certificate.service';
import type { CreateCertificateDto } from './dto/create-certificate.dto';
import type { NFTCertificate } from './entities/nft-certificate.entity';

@ApiTags('NFT证书管理')
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  // 创建NFT证书
  @Post('create')
  async createCertificate(
    @Body() createCertificateDto: CreateCertificateDto
  ): Promise<NFTCertificate> {
    return await this.certificateService.createCertificate(
      createCertificateDto.walletAddress,
      createCertificateDto.courseId
    );
  }
}
