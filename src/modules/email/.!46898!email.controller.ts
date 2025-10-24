import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { EmailService } from './email.service';

@ApiTags('邮件服务')
@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-custom')
  @ApiOperation({ summary: '发送自定义邮件' })
  @ApiBody({
    description: '发送自定义邮件',
    schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
