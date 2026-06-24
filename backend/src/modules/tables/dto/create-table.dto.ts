import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiProperty({ example: 'Table 1' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'floor-1' })
  @IsNotEmpty()
  @IsString()
  floorId: string;

  @ApiProperty({ example: 4 })
  @IsNotEmpty()
  @IsNumber()
  capacity: number;

  @ApiProperty({ example: 'Window seating', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'available', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
