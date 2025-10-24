import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

interface AuthenticatedUser {
  id: string;
  email: string;
  walletAddress: string;
  username: string;
  avatarUrl: string;
}

/**
 * @CurrentUser() 装饰�? * 从请求中提取当前用户信息
 *
 * 使用方式�? * @CurrentUser() user - 获取完整用户信息
 * @CurrentUser('walletAddress') walletAddress - 获取钱包地址
 * @CurrentUser('username') username - 获取用户�? * @CurrentUser('email') email - 获取邮箱
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      return undefined;
    }

    // 如果指定了字段，返回该字段的值 
    if (data) {
      return user[data];
    }

    // 否则返回完整用户信息
    return user;
  }
);

/**
 * @UserWallet() 装饰器 * 专门用于获取用户钱包地址的快捷装饰器
 */
export const UserWallet = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as AuthenticatedUser;
  return user?.walletAddress;
});

/**
 * @UserId() 装饰�? * 专门用于获取用户ID的快捷装饰器
 */
export const UserId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as AuthenticatedUser;
  return user?.id;
});
