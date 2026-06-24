import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ example: 'user-123' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: 'Morning shift' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
