// 注册为讲师DTO
import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class RegisterUserDto extends OmitType(CreateUserDto, ['walletAddress'] as const) {
 
}
