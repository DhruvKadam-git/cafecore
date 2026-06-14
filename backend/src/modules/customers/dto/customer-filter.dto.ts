import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO for filtering and paginating customers
 * Used in GET /customers endpoint
 */
export class CustomerFilterDto {
    @ApiProperty({
        description: 'Search query (searches name, email, phone number)',
        example: 'john',
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    })
    @IsString({ message: 'Search query must be a string' })
    search?: string;

    @ApiProperty({
        description: 'Page number (starts from 1)',
        example: 1,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Page must be an integer' })
    @Min(1, { message: 'Page must be at least 1' })
    page?: number = 1;

    @ApiProperty({
        description: 'Number of records per page',
        example: 10,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit must be at least 1' })
    limit?: number = 10;
}
