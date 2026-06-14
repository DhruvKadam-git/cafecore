import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateKdsStatusDto } from '../dto/update-kds-status.dto';
import { ResourceNotFoundException } from '../../../common/exceptions/custom.exception';

@Injectable()
export class KdsService {
  constructor(private prisma: PrismaService) {}

  async getOrderQueue() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return this.prisma.order.findMany({
      where: {
        OR: [
          {
            status: {
              in: ['SENT_TO_KITCHEN', 'PREPARING'],
            },
          },
          {
            status: {
              in: ['COMPLETED', 'PAID'],
            },
            updatedAt: {
              gte: startOfToday,
            },
          },
        ],
      },
      select: {
        id: true,
        status: true,
        customerId: true,
        tableId: true,
        createdAt: true,
        updatedAt: true,
        orderItems: {
          select: {
            id: true,
            quantity: true,
            unitPriceSnapshot: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getOrderDetails(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        customerId: true,
        tableId: true,
        createdAt: true,
        orderItems: {
          select: {
            id: true,
            quantity: true,
            unitPriceSnapshot: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new ResourceNotFoundException('Order');
    }

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    updateStatusDto: UpdateKdsStatusDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new ResourceNotFoundException('Order');
    }

    let dbStatus = String(updateStatusDto.status).toUpperCase();
    if (dbStatus === 'CONFIRMED' || dbStatus === 'PENDING') {
      dbStatus = 'SENT_TO_KITCHEN';
    } else if (dbStatus === 'READY' || dbStatus === 'SERVED') {
      dbStatus = 'COMPLETED';
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dbStatus as any,
      },
      select: {
        id: true,
        status: true,
        customerId: true,
        tableId: true,
        orderItems: {
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async markOrderReady(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new ResourceNotFoundException('Order');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED' as any,
      },
      select: {
        id: true,
        status: true,
        customerId: true,
        tableId: true,
        orderItems: {
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
