import { IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../../../common/enums';

export class UpdatePaymentDto {
  @ApiProperty({ example: 'completed', enum: PaymentStatus, required: false })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;
}
