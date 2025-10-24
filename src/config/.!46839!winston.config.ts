import type { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const isDevelopment = process.env.NODE_ENV !== 'production';

