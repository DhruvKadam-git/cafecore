import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { ResourceNotFoundException } from '../../../common/exceptions/custom.exception';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        include: { items: true, payment: true },
      }),
      this.prisma.order.count(),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, payment: true },
    });

    if (!order) {
      throw new ResourceNotFoundException('Order');
    }

    return order;
  }

  async create(createOrderDto: CreateOrderDto) {
    const { customerId, tableId, items } = createOrderDto;

    return this.prisma.order.create({
      data: {
        customerId,
        tableId,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0,
          })),
        },
      },
      include: { items: true },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new ResourceNotFoundException('Order');
    }

    const dataToUpdate: any = {};
    if (updateOrderDto.status) dataToUpdate.status = updateOrderDto.status;
    if (updateOrderDto.notes) dataToUpdate.notes = updateOrderDto.notes;

    return this.prisma.order.update({
      where: { id },
      data: dataToUpdate,
      include: { items: true, payment: true },
    });
  }

  async delete(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new ResourceNotFoundException('Order');
    }

    return this.prisma.order.delete({
      where: { id },
    });
  }
}
