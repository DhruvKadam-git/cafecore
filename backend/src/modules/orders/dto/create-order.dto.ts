import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

/**
 * DTO for creating a new order
 * Validates input data for POST /orders endpoint
 */
export class CreateOrderDto {
  @ApiProperty({
    description: 'Session ID',
    example: 'session-uuid',
  })
  @IsString({ message: 'Session ID must be a string' })
  sessionId: string;

  @ApiProperty({
    description: 'Table ID',
    example: 'table-uuid',
  })
  @IsString({ message: 'Table ID must be a string' })
  tableId: string;

  @ApiProperty({
    description: 'Customer ID (optional)',
    example: 'customer-uuid',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Customer ID must be a string' })
  customerId?: string;

  @ApiProperty({
    description: 'Order notes',
    example: 'No sugar in coffee',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @ApiProperty({
    description: 'Order items',
    type: [CreateOrderItemDto],
    example: [
      {
        productId: 'product-uuid-1',
        quantity: 2,
      },
      {
        productId: 'product-uuid-2',
        quantity: 1,
      },
    ],
  })
  @IsArray({ message: 'Items must be an array' })
  @ArrayMinSize(1, { message: 'Order must contain at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
