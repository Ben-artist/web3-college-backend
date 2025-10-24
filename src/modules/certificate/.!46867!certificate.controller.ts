import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { CertificateService } from './certificate.service';
import type { CreateCertificateDto } from './dto/create-certificate.dto';
import type { NFTCertificate } from './entities/nft-certificate.entity';
import { CreateCertificateApiDoc, getUserCertificatesApiDoc } from './swagger-doc.ts';

@ApiTags('NFT证书管理')
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  // 创建NFT证书
  @Post('create')
  @CreateCertificateApiDoc()
  async createCertificate(
    @Body() createCertificateDto: CreateCertificateDto
  ): Promise<NFTCertificate> {
    return await this.certificateService.createCertificate(
      createCertificateDto.walletAddress,
      createCertificateDto.courseId
    );
  }

