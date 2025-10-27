import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { WinstonModule } from 'nest-winston';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { AppLoggerService } from './common/services/logger.service';
import { createDatabaseConfig } from './config/database.config';
import { validate } from './config/env.validation';
import { winstonConfig } from './config/winston.config';
import { CertificateModule } from './modules/certificate/certificate.module';
import { CourseModule } from './modules/course/course.module';
import { EmailModule } from './modules/email/email.module';
import { StorageModule } from './modules/storage/storage.module';
import { UserModule } from './modules/user/user.module';
import { ChapterModule } from './modules/chapter/chapter.module';
/**
 * 应用主模块
 * 负责导入所有必要的模块和配置
 */
@Module({
  controllers: [],
  providers: [
    AppLoggerService,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  imports: [
    SentryModule.forRoot(),
    WinstonModule.forRoot(winstonConfig),
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
      envFilePath: ['.env', '.env.development'],
      validate, // 环境变量验证
    }),
    // JWT模块 - 全局配置
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),

    // 数据库配置
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createDatabaseConfig,
      inject: [ConfigService],
    }),

    // 文件上传配置
    MulterModule.register({
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),
    // 业务模块
    UserModule,
    CourseModule,
    StorageModule,
    CertificateModule,
    EmailModule,
    ChapterModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用请求日志中间件到所有路由
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
