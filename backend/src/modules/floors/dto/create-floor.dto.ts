import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFloorDto {
  @ApiProperty({ example: 'Ground Floor' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Main dining area', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  floorNumber: number;
}
