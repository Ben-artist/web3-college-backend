import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmailService } from './email.service';

@ApiTags('邮件服务')
@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('welcome')
  @ApiOperation({ summary: '发送欢迎邮件' })
  @ApiBody({
    description: '发送欢迎邮件',
    schema: {
      type: 'object',
      properties: {
        userEmail: {
          type: 'string',
          description: '用户邮箱',
          example: 'user@example.com',
        },
        username: {
          type: 'string',
          description: '用户名（可选）',
          example: '张三',
        },
        walletAddress: {
          type: 'string',
          description: '钱包地址（可选）',
          example: '0x1234...5678',
        },
      },
      required: ['userEmail'],
    },
  })
  @ApiResponse({ status: 200, description: '欢迎邮件发送成功' })
  async sendWelcomeEmail(
    @Body('userEmail') userEmail: string,
    @Body('username') username?: string,
    @Body('walletAddress') walletAddress?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.emailService.sendWelcomeEmail(userEmail, username, walletAddress);
      return {
        success: true,
        message: '欢迎邮件发送成功',
      };
    } catch (_error) {
      return {
        success: false,
        message: '欢迎邮件发送失败',
      };
    }
  }

  @Post('course-completion')
  @ApiOperation({ summary: '发送课程完成通知邮件' })
  @ApiBody({
    description: '发送课程完成通知邮件',
    schema: {
      type: 'object',
      properties: {
        userEmail: {
          type: 'string',
          description: '用户邮箱',
          example: 'user@example.com',
        },
        username: {
          type: 'string',
          description: '用户名（可选）',
          example: '张三',
        },
        walletAddress: {
          type: 'string',
          description: '钱包地址（可选）',
          example: '0x1234...5678',
        },
        courseTitle: {
          type: 'string',
          description: '课程标题',
          example: '区块链基础课程',
        },
        certificateUrl: {
          type: 'string',
          description: '证书链接',
          example: 'https://example.com/certificate',
        },
      },
      required: ['userEmail', 'courseTitle', 'certificateUrl'],
    },
  })
  @ApiResponse({ status: 200, description: '课程完成邮件发送成功' })
  async sendCourseCompletionEmail(
    @Body('userEmail') userEmail: string,
    @Body('courseTitle') courseTitle: string,
    @Body('certificateUrl') _certificateUrl: string,
    @Body('username') username?: string,
    @Body('walletAddress') walletAddress?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.emailService.sendCourseCompletionEmail(
        userEmail,
        courseTitle,
        username,
        walletAddress
      );
      return {
        success: true,
        message: '课程完成邮件发送成功',
      };
    } catch (_error) {
      return {
        success: false,
        message: '课程完成邮件发送失败',
      };
    }
  }

  @Post('nft-certificate')
  @ApiOperation({ summary: '发送NFT证书邮件' })
  @ApiBody({
    description: '发送NFT证书邮件',
    schema: {
      type: 'object',
      properties: {
        userEmail: {
          type: 'string',
          description: '用户邮箱',
          example: 'user@example.com',
        },
        username: {
          type: 'string',
          description: '用户名（可选）',
          example: '张三',
        },
        walletAddress: {
          type: 'string',
          description: '钱包地址（可选）',
          example: '0x1234...5678',
        },
        courseTitle: {
          type: 'string',
          description: '课程标题',
          example: '区块链基础课程',
        },
        nftUrl: {
          type: 'string',
          description: 'NFT链接',
          example: 'https://gateway.pinata.cloud/ipfs/QmHash',
        },
        tokenId: {
          type: 'string',
          description: 'Token ID',
          example: '1-1640995200000-abc123def',
        },
      },
      required: ['userEmail', 'courseTitle', 'nftUrl', 'tokenId'],
    },
  })
  @ApiResponse({ status: 200, description: 'NFT证书邮件发送成功' })
  async sendNFTCertificateEmail(
    @Body('userEmail') userEmail: string,
    @Body('courseTitle') courseTitle: string,
    @Body('nftUrl') nftUrl: string,
    @Body('tokenId') _tokenId: string,
    @Body('username') username?: string,
    @Body('walletAddress') walletAddress?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.emailService.sendNFTCertificateEmail(
        userEmail,
        courseTitle,
        nftUrl,
        username,
        walletAddress
      );
      return {
        success: true,
        message: 'NFT证书邮件发送成功',
      };
    } catch (_error) {
      return {
        success: false,
        message: 'NFT证书邮件发送失败',
      };
    }
  }
}
