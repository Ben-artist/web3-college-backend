import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
@Injectable()
export class StorachaStorageService {
  private readonly logger = new Logger(StorachaStorageService.name);
  private readonly pinataJwtToken: string;
  private readonly pinataGatewayDomain: string;
  private readonly pinataUploadUrl: string;
  private readonly pinataFileUrl: string;
  constructor(private configService: ConfigService) {
    this.pinataJwtToken = this.configService.get<string>('PINATA_JWT_TOKEN') || '';
    this.pinataGatewayDomain = this.configService.get<string>('PINATA_GATEWAY_DOMAIN') || '';
    this.pinataUploadUrl = this.configService.get<string>('PINATA_UPLOAD_URL') || '';
    this.pinataFileUrl = this.configService.get<string>('PINATA_FILE_URL') || '';

    if (!this.pinataJwtToken) {
      throw new Error(
        'Pinata API credentials are required. Please set PINATA_API_KEY and PINATA_SECRET_KEY in your .env file'
      );
    }

    this.logger.log('Pinata IPFS service initialized');
  }

  /**
   *
