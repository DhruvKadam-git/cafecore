import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { ResourceNotFoundException } from '../../../common/exceptions/custom.exception';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findByOrderId(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
    });

    if (!payment) {
      throw new ResourceNotFoundException('Payment');
    }

    return payment;
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const { orderId, amount, method } = createPaymentDto;

    return this.prisma.payment.create({
      data: {
        orderId,
        amount,
        method: String(method) as any,
        status: 'PENDING',
      },
    });
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      throw new ResourceNotFoundException('Payment');
    }

    const dataToUpdate: any = {};
    if (updatePaymentDto.status) dataToUpdate.status = updatePaymentDto.status;
    if (updatePaymentDto.amount !== undefined)
      dataToUpdate.amount = updatePaymentDto.amount;

    return this.prisma.payment.update({
      where: { id },
      data: dataToUpdate,
    });
  }
}
