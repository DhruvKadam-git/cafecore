import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsUUID, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for creating a new restaurant table
 * Validates input data for POST /tables endpoint
 * Works with both JSON and multipart/form-data
 */
export class CreateTableDto {
  @ApiProperty({
    description: 'UUID of the floor where table belongs',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString({ message: 'Floor ID must be a string' })
  @IsUUID('4', { message: 'Floor ID must be a valid UUID' })
  floorId: string;

  @ApiProperty({
    description: 'Table number/identifier (unique per floor)',
    example: 'T1',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString({ message: 'Table number must be a string' })
  tableNumber: string;

  @ApiProperty({
    description: 'Number of seats at the table',
    example: 4,
  })
  @Transform(({ value }) => {
    if (value === null || value === undefined) {
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
  seats: number;
}
