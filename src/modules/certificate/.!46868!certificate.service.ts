import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';
import type { StorachaStorageService } from '../storage/storage.service';
import { User } from '../user/entities/user.entity';
import { NFTCertificate } from './entities/nft-certificate.entity';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(NFTCertificate)
    private certificateRepository: Repository<NFTCertificate>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private storageService: StorachaStorageService
  ) {}

  /**
   * 生成SVG证书
   */
  private generateSVGCertificate(
    walletAddress: string,
    courseId: number,
    courseTitle: string,
    username?: string
  ): string {
    const displayName = username || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    const completionDate = new Date().toLocaleDateString('zh-CN');

    return `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="800" height="600" fill="url(#bg)" />

  <!-- 边框装饰 -->
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="url(#border)" stroke-width="4" rx="20" />
  <rect x="40" y="40" width="720" height="520" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" rx="15" />

  <!-- 标题 -->
  <text x="400" y="120" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="bold">
    Web3大学
  </text>
  <text x="400" y="160" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-size="24">
    课程完成证书
  </text>

  <!-- 证书内容 -->
  <text x="400" y="250" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18">
