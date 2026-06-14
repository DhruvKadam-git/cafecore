import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';

/**
 * DTO for updating an order
 * Only allows updating notes for DRAFT orders
 * Status changes are handled by separate endpoints
 */
export class UpdateOrderDto {
  @ApiProperty({
    description: 'Order notes',
    example: 'Add extra sugar',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @ApiProperty({
    description: 'Customer ID (optional)',
    example: 'customer-uuid',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Customer ID must be a string' })
  customerId?: string;
}
