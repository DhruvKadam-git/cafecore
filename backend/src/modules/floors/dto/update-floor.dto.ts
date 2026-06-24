import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFloorDto {
  @ApiProperty({ example: 'Ground Floor', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Main dining area', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  floorNumber?: number;
}
