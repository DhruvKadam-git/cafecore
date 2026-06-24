import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PromotionType } from '../../../common/enums';

export class UpdatePromotionDto {
  @ApiProperty({ example: 'Summer Sale', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Limited time summer promotion', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'percentage', enum: PromotionType, required: false })
  @IsOptional()
  @IsEnum(PromotionType)
  type?: PromotionType;

  @ApiProperty({ example: 40, required: false })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiProperty({ example: '2025-06-30', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiProperty({ example: '2025-08-31', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
