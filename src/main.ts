import { NestFactory } from '@nestjs/core';
// import "./instrument";
import { ValidationPipe, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AppLoggerService } from './common/services/logger.service';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
  
/**
 * 应用程序启动入口
 * 配置全局中间件和管道
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // 使用Winston作为应用日志
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const logger = app.get(AppLoggerService);

  const apiPrefix = process.env.API_PREFIX || 'api';

  // 设置全局前缀
  app.setGlobalPrefix(apiPrefix);

  // 启用版本控制（URI方式）
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // 允许携带凭证（Cookie）
  const allowedOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });
  
  // 解析Cookie
  app.use(cookieParser());
  
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      skipSuccessfulRequests: true, // 跳过成功的请求，只限制错误请求
    })
  );

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('Web3 University API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // 启动服务器
  const port = 4000;
  await app.listen(port);

  logger.log(`🚀 应用程序运行在 http://localhost:${port}`, 'Bootstrap');
  logger.log(`📚 API文档地址: http://localhost:${port}/${apiPrefix}`, 'Bootstrap');
  return app;
}

bootstrap();
