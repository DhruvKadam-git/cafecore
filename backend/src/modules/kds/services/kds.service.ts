import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateKdsStatusDto } from '../dto/update-kds-status.dto';
import { ResourceNotFoundException } from '../../../common/exceptions/custom.exception';

@Injectable()
export class KdsService {
  constructor(private prisma: PrismaService) {}

  async getOrderQueue() {
    return this.prisma.order.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'PREPARING'],
        },
      },
      select: {
        id: true,
        status: true,
        customerId: true,
        tableId: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
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
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
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

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: String(updateStatusDto.status) as any,
      },
      select: {
        id: true,
        status: true,
        customerId: true,
        tableId: true,
        items: {
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
        status: 'READY' as any,
      },
      select: {
        id: true,
        status: true,
        customerId: true,
        tableId: true,
        items: {
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
