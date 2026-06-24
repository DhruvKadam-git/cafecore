import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PromotionType } from '../../../common/enums';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Summer Sale' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Limited time summer promotion' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'percentage', enum: PromotionType })
  @IsNotEmpty()
  @IsEnum(PromotionType)
  type: PromotionType;

  @ApiProperty({ example: 30 })
  @IsNotEmpty()
  @IsNumber()
  value: number;

  @ApiProperty({ example: '2025-06-30' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ example: '2025-08-31' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isActive?: boolean;
}
