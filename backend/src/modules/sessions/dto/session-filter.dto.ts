import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for filtering and paginating sessions
 * Used in GET /sessions endpoint
 */
export class SessionFilterDto {
    @ApiProperty({
        description: 'Session status filter',
        enum: ['OPEN', 'CLOSED'],
        required: false,
    })
    @IsOptional()
    @IsEnum(['OPEN', 'CLOSED'], {
        message: 'Status must be OPEN or CLOSED',
    })
    status?: 'OPEN' | 'CLOSED';

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
