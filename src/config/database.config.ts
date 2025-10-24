import type { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * 数据库配置工厂函数 */
export const createDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  // Supabase配置
  const supabaseUrl = configService.get<string>('DATABASE_URL');
  return {
    url: supabaseUrl,
    type: 'postgres',
    entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
    synchronize: true,
    logging: configService.get<string>('NODE_ENV') === 'development',
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    migrationsRun: false,
    autoLoadEntities: true,
    ssl: {
      rejectUnauthorized: false,
    },
    extra: {
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 15, // 连接池模式下使用较小的连接数
    },
  };
};
