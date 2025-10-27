import type { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * 数据库配置工厂函数
 * 针对 Lambda 环境进行了优化：
 * 1. 较小的连接池配置以适应无服务器环境
 * 2. 更短的超时时间以快速失败
 * 3. 支持连接复用以减少冷启动影响
 */
export const createDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  // 检测是否运行在 Lambda 环境
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  
  // Supabase配置
  const supabaseUrl = configService.get<string>('DATABASE_URL');
  
  // Lambda 环境下使用更小的连接池配置
  const poolConfig = isLambda
    ? {
        max: Number(configService.get<string>('DB_POOL_MAX', '5')), // Lambda: 最多5个连接
        min: Number(configService.get<string>('DB_POOL_MIN', '1')), // Lambda: 最少1个连接
        connectionTimeoutMillis: Number(configService.get<string>('DB_POOL_ACQUIRE_TIMEOUT', '10000')),
        idleTimeoutMillis: Number(configService.get<string>('DB_POOL_IDLE_TIMEOUT', '10000')),
      }
    : {
        max: Number(configService.get<string>('DB_POOL_MAX', '15')), // 传统环境: 更多连接
        min: Number(configService.get<string>('DB_POOL_MIN', '2')),
        connectionTimeoutMillis: Number(configService.get<string>('DB_POOL_ACQUIRE_TIMEOUT', '30000')),
        idleTimeoutMillis: Number(configService.get<string>('DB_POOL_IDLE_TIMEOUT', '30000')),
      };

  return {
    url: supabaseUrl,
    type: 'postgres',
    entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
    // 生产环境禁用自动同步，使用迁移
    synchronize: nodeEnv === 'development',
    logging: nodeEnv === 'development',
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    migrationsRun: false,
    autoLoadEntities: true,
    ssl: {
      rejectUnauthorized: false,
    },
    extra: {
      ...poolConfig,
      // 启用连接检查，确保连接有效
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    },
    // Lambda 环境下禁用连接池日志以减少开销
    poolErrorHandler: isLambda
      ? (err) => {
          console.error('Database pool error:', err);
        }
      : undefined,
  };
};
