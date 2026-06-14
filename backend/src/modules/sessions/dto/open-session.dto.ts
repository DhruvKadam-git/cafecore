import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO for opening a new POS session
 * Validates input data for POST /sessions/open endpoint
 * Works with both JSON and multipart/form-data
 */
export class OpenSessionDto {
    @ApiProperty({
        description: 'Opening cash amount (optional)',
        example: 1000,
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === null || value === undefined || value === '') {
            return value;
        }
        if (typeof value === 'string') {
            return parseFloat(value);
        }
        return value;
    })
    @IsNumber({}, { message: 'Opening amount must be a number' })
    @Min(0, { message: 'Opening amount must not be negative' })
    openingAmount?: number;
}
