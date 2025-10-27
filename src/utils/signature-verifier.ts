import { ethers } from 'ethers';

/**
 * Web3签名验证工具类
 */
export class SignatureVerifier {
  /**
   * 验证Web3钱包签名
   * @param walletAddress 钱包地址
   * @param message 原始消息
   * @param signature 签名
   * @returns 验证结果
   */
  static async verifySignature(
    walletAddress: string,
    message: string,
    signature: string,
  ): Promise<boolean> {
    try {
      // 验证签名格式
      if (!this.isValidSignature(signature)) {
        return false;
      }

      // 验证钱包地址格式
      if (!ethers.isAddress(walletAddress)) {
        return false;
      }

      // 恢复签名者地址
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      // 比较地址（不区分大小写）
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      console.error('签名验证失败:', error);
      return false;
    }
  }

  /**
   * 验证签名格式是否正确
   * @param signature 签名字符串
   * @returns 是否为有效签名格式
   */
  private static isValidSignature(signature: string): boolean {
    // 检查签名是否以0x开头
    if (!signature.startsWith('0x')) {
      return false;
    }

    // 检查签名长度（以太坊签名应该是130个字符，包括0x）
    if (signature.length !== 132) {
      return false;
    }

    // 检查是否为有效的十六进制字符串
    const hexPattern = /^0x[a-fA-F0-9]+$/;
    return hexPattern.test(signature);
  }

  /**
   * 生成标准的Web3登录消息
   * @param walletAddress 钱包地址
   * @param timestamp 时间戳（可选）
   * @returns 格式化的消息
   */
  static generateLoginMessage(
    walletAddress: string,
    timestamp?: number,
  ): string {
    const ts = timestamp || Date.now();
    return `Web3 College Login\nWallet: ${walletAddress}\nTimestamp: ${ts}`;
  }

  /**
   * 生成标准的Web3注册消息
   * @param walletAddress 钱包地址
   * @param username 用户名
   * @param timestamp 时间戳（可选）
   * @returns 格式化的消息
   */
  static generateRegisterMessage(
    walletAddress: string,
    username: string,
    timestamp?: number,
  ): string {
    const ts = timestamp || Date.now();
    return `Web3 College Registration\nWallet: ${walletAddress}\nUsername: ${username}\nTimestamp: ${ts}`;
  }

  /**
   * 验证消息是否在有效时间范围内
   * @param message 消息内容
   * @param maxAgeMinutes 最大有效期（分钟）
   * @returns 是否在有效期内
   */
  static isMessageValid(message: string, maxAgeMinutes: number = 10): boolean {
    try {
      // 从消息中提取时间戳
      const timestampMatch = message.match(/Timestamp: (\d+)/);
      if (!timestampMatch) {
        return false;
      }

      const messageTimestamp = parseInt(timestampMatch[1]);
      const currentTimestamp = Date.now();
      const maxAge = maxAgeMinutes * 60 * 1000; // 转换为毫秒

      return (currentTimestamp - messageTimestamp) <= maxAge;
    } catch (error) {
      console.error('消息时间验证失败:', error);
      return false;
    }
  }
}
