import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { NFTCertificate } from './entities/nft-certificate.entity';

export function CreateCertificateApiDoc() {
  return applyDecorators(
    ApiBody({
      description: '创建证书',
      schema: {
        type: 'object',
        properties: {
          walletAddress: {
            type: 'string',
            description: '用户钱包地址',
            example: '0x1234567890123456789012345678901234567890',
          },
          courseId: {
            type: 'number',
            description: '课程ID',
            example: 1,
          },
        },
        required: ['walletAddress', 'courseId'],
      },
    }),
    ApiResponse({
      status: 201,
      description: '证书创建成功',
      type: NFTCertificate,
    }),
    ApiResponse({ status: 404, description: '用户或课程不存在' }),
