import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import  { ConfigService } from '@nestjs/config';
import  { Reflector } from '@nestjs/core';
import  { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT认证守卫
 * 基于NestJS官方JWT认证实现，不使用Passport
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否有@Public()装饰器   
     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 将用户信息附加到请求对象
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractToken(request: any): string | undefined {
    if (request.cookies) {
      return request.cookies['auth_token'];
    }
    return undefined;
  }
}
