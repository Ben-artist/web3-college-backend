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

  // 通用发送邮件方�?  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      text,
      html: html || text, // 如果没有HTML，使用纯文本
    });
  }

  // 发送欢迎邮�?  async sendWelcomeEmail(to: string, username?: string, walletAddress?: string): Promise<void> {
    const displayName = username || this.formatWalletAddress(walletAddress);

    const subject = '欢迎加入Web3大学�?;
    const text = `亲爱�?${displayName}，\n\n欢迎加入Web3大学！我们很高兴您成为我们社区的一员。\n\n在这里，您将学习到：\n- 区块链基础知识\n- 智能合约开发\n- DeFi协议使用\n- NFT技术应用\n- Web3安全最佳实践\n\n开始您的Web3学习之旅吧！\n\nWeb3大学团队`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">欢迎加入Web3大学�?/h2>
        <p>亲爱�?${displayName}�?/p>
        <p>欢迎加入Web3大学！我们很高兴您成为我们社区的一员�?/p>
        <h3>在这里，您将学习到：</h3>
        <ul>
          <li>区块链基础知识</li>
          <li>智能合约开�?/li>
          <li>DeFi协议使用</li>
          <li>NFT技术应�?/li>
          <li>Web3安全最佳实�?/li>
        </ul>
        <p>开始您的Web3学习之旅吧！</p>
        <p>Web3大学团队</p>
      </div>
    `;

    await this.sendEmail(to, subject, text, html);
  }

  // 发送课程完成邮�?  async sendCourseCompletionEmail(
    to: string,
    courseTitle: string,
    username?: string,
    walletAddress?: string
  ): Promise<void> {
    const displayName = username || this.formatWalletAddress(walletAddress);

    const subject = `恭喜完成课程�?{courseTitle}`;
    const text = `亲爱�?${displayName}，\n\n恭喜您成功完成了课程"${courseTitle}"！\n\n您的努力和坚持值得赞扬。现在您可以：\n- 查看您的学习证书\n- 继续学习其他课程\n- 分享您的成就\n\n继续您的Web3学习之旅！\n\nWeb3大学团队`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">恭喜完成课程�?/h2>
        <p>亲爱�?${displayName}�?/p>
        <p>恭喜您成功完成了课程"<strong>${courseTitle}</strong>"�?/p>
        <p>您的努力和坚持值得赞扬。现在您可以�?/p>
        <ul>
          <li>查看您的学习证书</li>
          <li>继续学习其他课程</li>
          <li>分享您的成就</li>
        </ul>
        <p>继续您的Web3学习之旅�?/p>
        <p>Web3大学团队</p>
      </div>
    `;

    await this.sendEmail(to, subject, text, html);
  }

  // 发送NFT证书邮件
  async sendNFTCertificateEmail(
    to: string,
    courseTitle: string,
    nftUrl: string,
    username?: string,
    walletAddress?: string
  ): Promise<void> {
    const displayName = username || this.formatWalletAddress(walletAddress);

    const subject = `您的NFT证书已生成：${courseTitle}`;
    const text = `亲爱�?${displayName}，\n\n恭喜您完成了课程"${courseTitle}"！\n\n您的NFT证书已经生成，请查看：\n${nftUrl}\n\n这个证书是您在区块链上的永久记录，证明了您的学习成就。\n\nWeb3大学团队`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6;">您的NFT证书已生成！</h2>
        <p>亲爱�?${displayName}�?/p>
        <p>恭喜您完成了课程"<strong>${courseTitle}</strong>"�?/p>
        <p>您的NFT证书已经生成，请查看�?/p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${nftUrl}" style="background-color: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">查看证书</a>
        </div>
        <p>这个证书是您在区块链上的永久记录，证明了您的学习成就�?/p>
        <p>Web3大学团队</p>
      </div>
    `;

    await this.sendEmail(to, subject, text, html);
  }

  // 发送课程购买邮�?  async sendCoursePurchaseEmail(
    to: string,
    courseTitle: string,
    username?: string,
    walletAddress?: string
  ): Promise<void> {
    const displayName = username || this.formatWalletAddress(walletAddress);

    const subject = `课程购买成功�?{courseTitle}`;
    const text = `亲爱�?${displayName}，\n\n感谢您购买课�?${courseTitle}"！\n\n您现在可以：\n- 立即开始学习\n- 访问所有课程内容\n- 获得学习证书\n- 参与社区讨论\n\n祝您学习愉快！\n\nWeb3大学团队`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">课程购买成功�?/h2>
        <p>亲爱�?${displayName}�?/p>
        <p>感谢您购买课�?<strong>${courseTitle}</strong>"�?/p>
        <p>您现在可以：</p>
        <ul>
          <li>立即开始学�?/li>
          <li>访问所有课程内�?/li>
          <li>获得学习证书</li>
          <li>参与社区讨论</li>
        </ul>
        <p>祝您学习愉快�?/p>
        <p>Web3大学团队</p>
      </div>
    `;

    await this.sendEmail(to, subject, text, html);
  }

  // 发送自定义邮件
  async sendCustomEmail(
    to: string,
    subject: string,
    content: string,
    isHtml = false
  ): Promise<void> {
    await this.sendEmail(to, subject, content, isHtml ? content : undefined);
  }

  // 发送邮箱验证码邮件
  async sendVerificationCodeEmail(
    to: string,
    code: string,
    username?: string,
    walletAddress?: string
  ): Promise<void> {
    const displayName = username || this.formatWalletAddress(walletAddress);

    const subject = 'Web3大学邮箱验证�?;
    const text = `亲爱�?${displayName}，\n\n您的邮箱验证码为�?{code}\n验证码将�?0分钟后过期，请尽快完成验证。\n\n如果不是您本人操作，请忽略此邮件。\n\nWeb3大学团队`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">邮箱验证�?/h2>
        <p>亲爱�?${displayName}�?/p>
        <p>您的邮箱验证码为�?/p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #2563eb; margin: 16px 0;">
          ${code}
        </div>
        <p>验证码将�?<strong>10 分钟</strong> 后过期，请尽快完成验证�?/p>
        <p>如果不是您本人操作，请忽略此邮件�?/p>
        <p style="margin-top: 32px;">Web3大学团队</p>
      </div>
    `;

    await this.sendEmail(to, subject, text, html);
  }
}
