import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../../common/enums';

export class UpdateOrderDto {
  @ApiProperty({ example: 'preparing', enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ example: 'Special instructions', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
