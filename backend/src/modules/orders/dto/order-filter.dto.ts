import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

/**
 * DTO for filtering and paginating orders
 */
export class OrderFilterDto {
    @ApiProperty({
        description: 'Page number',
        example: 1,
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === null || value === undefined || value === '') {
            return 1;
        }
        if (typeof value === 'string') {
            return parseInt(value, 10);
        }
        return value;
    })
    @IsInt({ message: 'Page must be an integer' })
    @Min(1, { message: 'Page must be at least 1' })
    page: number = 1;

    @ApiProperty({
        description: 'Records per page',
        example: 10,
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === null || value === undefined || value === '') {
            return 10;
        }
        if (typeof value === 'string') {
            return parseInt(value, 10);
        }
        return value;
    })
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit must be at least 1' })
    limit: number = 10;

    @ApiProperty({
        description: 'Filter by order status',
        enum: ['DRAFT', 'SENT_TO_KITCHEN', 'PREPARING', 'COMPLETED', 'PAID', 'CANCELLED'],
        required: false,
    })
    @IsOptional()
    @IsEnum(['DRAFT', 'SENT_TO_KITCHEN', 'PREPARING', 'COMPLETED', 'PAID', 'CANCELLED'], {
        message: 'Invalid order status',
    })
    status?: OrderStatus;

    @ApiProperty({
        description: 'Search by order number',
        example: 'ORD-001',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Order number must be a string' })
    orderNumber?: string;

    @ApiProperty({
        description: 'Filter by customer ID',
        example: 'customer-uuid',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Customer ID must be a string' })
    customerId?: string;
}
