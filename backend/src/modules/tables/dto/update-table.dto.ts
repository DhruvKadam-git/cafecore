import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTableDto {
  @ApiProperty({ example: 'Table 1', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiProperty({ example: 'Window seating', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'occupied', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
