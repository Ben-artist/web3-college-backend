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
   * 上传�?Pinata IPFS @see https://docs.pinata.cloud/api-reference/endpoint/upload-a-file#body-group-id
   */
  async uploadToPinata(file: Buffer, filename: string) {
    try {
      const data = new FormData();
      data.append('file', new Blob([new Uint8Array(file)]));
      data.append('filename', filename);
      data.append('network', 'public');
      data.append('group_id', 'a27fe757-cfb5-422b-9287-bf461a24a770');
      const response = await fetch(this.pinataUploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.pinataJwtToken}`,
        },
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`Pinata API error: ${response.status} ${response.statusText}`, errorData);
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }
      const gatewayDomain = this.pinataGatewayDomain;
      const result = await response.json();
      const cid = result.data.cid;

      this.logger.log(`File uploaded to Pinata successfully: ${filename}, CID: ${cid}`);

      return {
        cid,
        filename,
        gatewayUrl: `https://${gatewayDomain}/ipfs/${cid}`, // 主网�?        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Pinata upload error for ${filename}:`, error.stack);
      throw error;
    }
  }

  /**
   * 列出已上传的文件 @see https://docs.pinata.cloud/api-reference/endpoint/list-files#parameter-page-token
   * @param limit 限制数量
   * @param offset 偏移�?   * @returns 文件列表
   */
  async listFiles(limit: number, offset: number) {
    try {
      const url = `${this.pinataFileUrl}/public?limit=${limit}&pageToken=${offset}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.pinataJwtToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`Pinata API error: ${response.status}`, errorData);
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }

      const result = await response.json();
      const files = result.data.files.map((file: any) => ({
        cid: file.cid,
        filename: file.name,
        size: file.size,
        createdAt: file.createdAt,
        gatewayUrl: `https://${this.pinataGatewayDomain}/ipfs/${file.cid}`,
      }));

      this.logger.log(`Retrieved ${files.length} files from Pinata (total: ${result.count})`);

      return {
        files,
        totalCount: result.data.files.length,
      };
    } catch (error) {
      this.logger.error('Failed to list files', error.stack);
      throw error;
    }
  }

  /**
   * @see https://docs.pinata.cloud/api-reference/endpoint/get-file-by-id
   * 获取文件信息
   * @param cid 内容标识�?   * @returns 文件信息
   */
  async getFileInfo(fileId: string) {
    try {
      // 验证文件是否存在�?Pinata
      const response = await fetch(`${this.pinataFileUrl}/public/${fileId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.pinataJwtToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`Pinata API error: ${response.status}`, errorData);
        throw new Error(`Failed to fetch file info: ${response.statusText}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      this.logger.error(`Failed to get file info for CID: ${fileId}`, error.stack);
      throw new NotFoundException(`File with CID ${fileId} not found`);
    }
  }

  /** @see https://docs.pinata.cloud/api-reference/endpoint/delete-file-by-id
   * 删除文件（从 Pinata 取消固定�?   * @param file_id 文件id
   */
  async deleteFile(fileId: string) {
    try {
      const response = await fetch(`${this.pinataFileUrl}/public/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.pinataJwtToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`Failed to delete file: ${response.status}`, errorData);
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      this.logger.log(`File unpinned ${fileId} successfully: ${fileId}`);
      return { message: 'File deleted successfully', file_id: fileId };
    } catch (error) {
      this.logger.error(`Failed to delete file: ${fileId}`, error.stack);
      throw error;
    }
  }
}
