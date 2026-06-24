import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';
import { ResourceNotFoundException } from '../../../common/exceptions/custom.exception';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.table.findMany({
      include: { floor: true, orders: true },
    });
  }

  async findById(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: { floor: true, orders: true },
    });

    if (!table) {
      throw new ResourceNotFoundException('Table');
    }

    return table;
  }

  async create(createTableDto: CreateTableDto) {
    return this.prisma.table.create({
      data: createTableDto,
      include: { floor: true },
    });
  }

  async update(id: string, updateTableDto: UpdateTableDto) {
    const table = await this.prisma.table.findUnique({ where: { id } });

    if (!table) {
      throw new ResourceNotFoundException('Table');
    }

    return this.prisma.table.update({
      where: { id },
      data: updateTableDto,
      include: { floor: true },
    });
  }

  async delete(id: string) {
    const table = await this.prisma.table.findUnique({ where: { id } });

    if (!table) {
      throw new ResourceNotFoundException('Table');
    }

    return this.prisma.table.delete({
      where: { id },
    });
  }
}
