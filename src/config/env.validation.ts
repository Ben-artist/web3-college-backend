import { z } from 'zod';

// 环境变量校验Schema
const envSchema = z.object({
  // 数据库配置（必需�?  DATABASE_URL: z.url({ message: 'DATABASE_URL must be a valid URL' }),

  // JWT配置（必需�?  JWT_SECRET: z.string().min(1, { message: 'JWT_SECRET 不能为空' }),

  // 应用配置
  PORT: z
    .string()
    .default('3000')
    .transform((val) => Number.parseInt(val, 10))
    .pipe(z.number().min(1).max(65535)),
  API_PREFIX: z.string().min(1).default('api'),
  // AWS配置
  AWS_ACCESS_KEY_ID: z.string().min(1, { message: 'AWS_ACCESS_KEY_ID 不能为空' }),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, { message: 'AWS_SECRET_ACCESS_KEY 不能为空' }),
  AWS_REGION: z.string().min(1, { message: 'AWS_REGION 不能为空' }),
  AWS_S3_BUCKET_NAME: z.string().min(1, { message: 'AWS_S3_BUCKET_NAME 不能为空' }),
  AWS_S3_UPLOAD_PREFIX: z.string().default('uploads/'),
});

// 导出类型
export type EnvironmentVariables = z.infer<typeof envSchema>;

// 校验函数
export function validate(config: Record<string, unknown>): EnvironmentVariables {
  try {
    return envSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        })
        .join('; ');

      throw new Error(`Configuration validation error: ${errorMessages}`);
    }
    throw error;
  }
}
