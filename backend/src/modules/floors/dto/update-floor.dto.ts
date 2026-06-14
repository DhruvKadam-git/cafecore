import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for updating floor information
 * Validates input data for PATCH /floors/:id endpoint
 * Works with both JSON and multipart/form-data
 */
export class UpdateFloorDto {
  @ApiProperty({
    description: 'Floor name (must be unique if updating)',
    example: 'Ground Floor',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString({ message: 'Floor name must be a string' })
  name?: string;

  @ApiProperty({
    description: 'Sort order for display',
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

  @ApiProperty({
    description: 'Whether the floor is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}
