import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
/**
 * 更新用户资料DTO
 * 排除钱包地址字段，因为钱包地址不应该被更新
 */
export class UpdateProfileDto extends PartialType(
  OmitType(CreateUserDto, ['walletAddress'] as const)
) {}
