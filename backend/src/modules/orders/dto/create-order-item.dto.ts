import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

/**
 * DTO for order items when creating an order
 * Represents individual products added to order
 */
export class CreateOrderItemDto {
    @ApiProperty({
        description: 'Product ID',
        example: 'product-uuid',
    })
    @IsString({ message: 'Product ID must be a string' })
    productId: string;

    @ApiProperty({
        description: 'Quantity of product',
        example: 2,
    })
    @IsInt({ message: 'Quantity must be an integer' })
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;
}
