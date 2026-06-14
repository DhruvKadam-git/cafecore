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
    const { orderId, amount, method, couponCode } = createPaymentDto;

    // Start transaction to create payment and mark order
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        amount,
        method: String(method) as any,
        status: 'COMPLETED',
      },
    });

    // Increment coupon usage count if provided
    if (couponCode) {
      try {
        const coupon = await this.prisma.coupon.findUnique({
          where: { code: couponCode.toUpperCase() },
        });
        if (coupon) {
          await this.prisma.coupon.update({
            where: { id: coupon.id },
            data: {
              currentUsageCount: {
                increment: 1,
              },
            },
          });
        }
      } catch (err) {
        console.error('Error incrementing coupon usage:', err);
      }
    }

    const orderObj = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    let targetStatus = 'SENT_TO_KITCHEN';
    let discountTotal = 0;
    let grandTotal = amount;

    if (orderObj) {
      if (
        orderObj.status === 'SENT_TO_KITCHEN' ||
        orderObj.status === 'PREPARING' ||
        orderObj.status === 'COMPLETED' ||
        orderObj.status === 'PAID'
      ) {
        targetStatus = orderObj.status;
      } else {
        targetStatus = 'SENT_TO_KITCHEN';
      }

      const sub = Number(orderObj.subtotal);
      const tax = Number(orderObj.taxTotal);
      const originalTotal = sub + tax;
      discountTotal = Math.max(0, originalTotal - amount);
      grandTotal = amount;
    }

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: targetStatus as any,
        paidAt: new Date(),
        discountTotal: discountTotal,
        grandTotal: grandTotal,
      },
    });

    // Release table
    await this.prisma.restaurantTable.update({
      where: { id: order.tableId },
      data: {
        status: 'AVAILABLE',
      },
    });

    return payment;
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
