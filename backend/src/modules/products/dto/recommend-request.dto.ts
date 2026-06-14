import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecommendRequestDto {
  @ApiProperty({
    description: 'Array of product IDs currently in the cart',
    example: ['uuid-latte-123', 'uuid-croissant-456']
  })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}
