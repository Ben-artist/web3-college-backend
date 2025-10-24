import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { PerformanceStatsDto, QueryPerformanceDto } from './dto/query-performance.dto';
import type { ReportPerformanceDto } from './dto/report-performance.dto';
import type { PerformanceService } from './performance.service';

/**
