import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'Get 20% discount' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 20 })
  @IsNotEmpty()
  @IsNumber()
  discountPercentage: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @ApiProperty({ example: '2025-12-31' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  expiryDate: Date;

  @ApiProperty({ example: 50 })
  @IsNotEmpty()
  @IsNumber()
  maxUsageCount: number;
}
