import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for creating a new floor
 * Validates input data for POST /floors endpoint
 * Works with both JSON and multipart/form-data
 */
export class CreateFloorDto {
  @ApiProperty({
    description: 'Floor name (must be unique)',
    example: 'Ground Floor',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString({ message: 'Floor name must be a string' })
  name: string;

  @ApiProperty({
    description: 'Sort order for display (lower numbers appear first)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return value;
    }
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
  })
  @IsNumber({}, { message: 'Sort order must be a number' })
  @IsInt({ message: 'Sort order must be an integer number' })
  @Min(0, { message: 'Sort order must not be less than 0' })
  sortOrder?: number;
}
