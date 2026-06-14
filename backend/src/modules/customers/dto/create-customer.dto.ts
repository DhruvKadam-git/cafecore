import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, IsEmail, IsOptional, IsPhoneNumber, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for creating a new customer
 * Validates input data for POST /customers endpoint
 * Works with both JSON and multipart/form-data
 */
export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer name (2-100 characters)',
    example: 'John Doe',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsNotEmpty({ message: 'Customer name is required' })
  @IsString({ message: 'Customer name must be a string' })
  @MinLength(2, { message: 'Customer name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Customer name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Customer email address (optional, valid email required)',
    example: 'john@example.com',
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
    description: 'Customer phone number (optional, 10-15 characters)',
    example: '9876543210',
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

  // Validate that at least one of email or phoneNumber exists
  static validateAtLeastOneContact(dto: CreateCustomerDto): boolean {
    return !!(dto.email || dto.phoneNumber);
  }
}
