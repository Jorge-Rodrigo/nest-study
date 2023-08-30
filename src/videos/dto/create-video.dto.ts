import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  description: string | null;

  @ApiProperty()
  @IsNotEmpty()
  @Min(1)
  @IsInt()
  @Type(() => Number)
  category_id: number;
}

export class CreateVideoWithUploadDto extends CreateVideoDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: string;
}
