import type { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  // 格式化钱包地址显示
  private formatWalletAddress(walletAddress?: string): string {
    if (!walletAddress) {
      return '未知用户';
    }
    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }

