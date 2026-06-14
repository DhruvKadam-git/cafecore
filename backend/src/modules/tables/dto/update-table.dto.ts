import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO for updating table information
 * Validates input data for PATCH /tables/:id endpoint
 * Works with both JSON and multipart/form-data
 */
export class UpdateTableDto {
  @ApiProperty({
    description: 'Table number/identifier',
    example: 'T1',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString({ message: 'Table number must be a string' })
  tableNumber?: string;

  @ApiProperty({
    description: 'Number of seats at the table',
    example: 4,
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
  @IsNumber({}, { message: 'Seats must be a number' })
  @IsInt({ message: 'Seats must be an integer number' })
  @Min(1, { message: 'Table must have at least 1 seat' })
  seats?: number;

  @ApiProperty({
    description: 'Current status of the table',
    enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'],
    example: 'AVAILABLE',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().toUpperCase();
    }
    return value;
  })
  @IsEnum(['AVAILABLE', 'OCCUPIED', 'RESERVED'], {
    message: 'Status must be AVAILABLE, OCCUPIED, or RESERVED',
  })
  status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';

  @ApiProperty({
    description: 'Whether the table is active',
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
