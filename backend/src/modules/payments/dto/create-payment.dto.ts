import { IsNotEmpty, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../../common/enums';

export class CreatePaymentDto {
  @ApiProperty({ example: 'order-123' })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ example: 500 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'card', enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
