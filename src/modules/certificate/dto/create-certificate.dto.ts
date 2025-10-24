import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({
    description: '用户钱包地址',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    description: '课程ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  courseId: number;
}
