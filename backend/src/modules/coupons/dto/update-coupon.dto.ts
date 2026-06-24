import { IsOptional, IsString, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCouponDto {
  @ApiProperty({ example: 'Get 20% discount', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 25, required: false })
  @IsOptional()
  @IsNumber()
  discountPercentage?: number;

  @ApiProperty({ example: 150, required: false })
  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiryDate?: Date;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  maxUsageCount?: number;
}
