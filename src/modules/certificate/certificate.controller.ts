import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CertificateService } from './certificate.service';
import type { CreateCertificateDto } from './dto/create-certificate.dto';
import type { NFTCertificate } from './entities/nft-certificate.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

@ApiTags('NFT证书管理')

@UseGuards(JwtAuthGuard)
@Controller('certificates')
export class CertificateController {
  constructor(
    private readonly certificateService: CertificateService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

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

  // 获取当前用户的证书列表
  @Get('my-certificates')
  @ApiOperation({ summary: '获取当前用户的NFT证书列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyCertificates(@UserId() userId: number): Promise<NFTCertificate[]> {
    // 根据用户ID获取用户信息
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) {
      return [];
    }
    
    // 使用钱包地址获取证书列表
    return await this.certificateService.getUserCertificates(user.walletAddress);
  }
}
