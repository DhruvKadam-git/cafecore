import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for updating customer information
 * Validates input data for PATCH /customers/:id endpoint
 * Works with both JSON and multipart/form-data
 */
export class UpdateCustomerDto {
  @ApiProperty({
    description: 'Customer name (2-100 characters)',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString({ message: 'Customer name must be a string' })
  @MinLength(2, { message: 'Customer name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Customer name must not exceed 100 characters' })
  name?: string;

  @ApiProperty({
    description: 'Customer email address (valid email required if provided)',
    example: 'john.updated@example.com',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
    return value;
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiProperty({
    description: 'Customer phone number (10-15 characters if provided)',
    example: '9999999999',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @MinLength(10, { message: 'Phone number must be at least 10 characters long' })
  @MaxLength(15, { message: 'Phone number must not exceed 15 characters' })
  phoneNumber?: string;
}
