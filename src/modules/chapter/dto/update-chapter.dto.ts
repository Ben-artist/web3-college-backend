import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { CreateChapterDto } from './create-chapter.dto';

export class UpdateChapterDto extends PartialType(CreateChapterDto){
  @ApiProperty({
    description: '章节ID',
    example: 1,
  })
  @IsNotEmpty({ message: '章节ID不能为空' })
  @IsNumber({}, { message: '章节ID必须是数字' })
  chapterId: number;
}


