import { IsOptional, IsUUID, IsString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProductFilterDto {
    @ApiProperty({
        description: 'Page number',
        example: 1,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @ApiProperty({
        description: 'Items per page',
        example: 10,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @ApiProperty({
        description: 'Filter by category ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
        required: false,
    })
    @IsOptional()
    @IsUUID('4', { message: 'Category ID must be a valid UUID' })
    categoryId?: string;

    @ApiProperty({
        description: 'Search by product name (case-insensitive)',
        example: 'Latte',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Search must be a string' })
    search?: string;

    @ApiProperty({
        description: 'Filter by active status',
        example: true,
        required: false,
    })
    @IsOptional()
    @Type(() => Boolean)
    @Transform(({ value }) => value === 'true' || value === true)
    isActive?: boolean;
}
