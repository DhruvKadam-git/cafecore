import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 'product-123' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 150, required: false })
  unitPrice?: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'customer-123' })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({ example: 'table-5' })
  @IsNotEmpty()
  @IsString()
  tableId: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
