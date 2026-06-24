import { IsString, MinLength, MaxLength, Matches, IsOptional, IsUrl, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Coffee',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Category name must be a string' })
  @MinLength(2, { message: 'Category name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Category name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Hex color code for the category',
    example: '#8B5E3C',
    pattern: '^#[0-9A-Fa-f]{6}$',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Category color must be a string' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex code (e.g., #8B5E3C)',
  })
  color?: string;

  @ApiProperty({
    description: 'Image URL (if not uploading file)',
    example: 'https://cdn.example.com/categories/coffee.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  imageUrl?: string;
}
