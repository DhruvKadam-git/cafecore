import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for closing a POS session
 * Validates input data for POST /sessions/:id/close endpoint
 * Works with both JSON and multipart/form-data
 */
export class CloseSessionDto {
    @ApiProperty({
        description: 'Closing cash amount',
        example: 5000,
    })
    @Transform(({ value }) => {
        if (value === null || value === undefined || value === '') {
            return value;
        }
        if (typeof value === 'string') {
            return parseFloat(value);
        }
        return value;
    })
    @IsNotEmpty({ message: 'Closing amount is required' })
    @IsNumber({}, { message: 'Closing amount must be a number' })
    @Min(0, { message: 'Closing amount must not be negative' })
    closingAmount: number;
}
