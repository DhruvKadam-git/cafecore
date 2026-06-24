import {
  IsString,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsOptional,
  IsUUID,
  IsInt,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({
    description: 'Category ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId?: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Premium Latte',
    minLength: 2,
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Product name must be a string' })
  @MinLength(2, { message: 'Product name must be at least 2 characters' })
  @MaxLength(150, { message: 'Product name must not exceed 150 characters' })
  name?: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Fresh premium hot latte',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Product description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Product image URL',
    example: '/uploads/products/premium-latte.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  imageUrl?: string;

  @ApiProperty({
    description: 'Product price',
    example: 200,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0.01, { message: 'Price must be greater than 0' })
  price?: number;

  @ApiProperty({
    description: 'Tax rate percentage (0-100)',
    example: 5,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'Tax rate must be at least 0' })
  @Max(100, { message: 'Tax rate must not exceed 100' })
  taxRate?: number;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'Cup',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Unit of measure must be a string' })
  unitOfMeasure?: string;

  @ApiProperty({
    description: 'Preparation time in minutes',
    example: 5,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Preparation time must be an integer' })
  @Min(1, { message: 'Preparation time must be at least 1 minute' })
  preparationTime?: number;

  @ApiProperty({
    description: 'Visible in Kitchen Display System',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'isKdsVisible must be a boolean' })
  isKdsVisible?: boolean;
}
