import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFloorDto } from '../dto/create-floor.dto';
import { UpdateFloorDto } from '../dto/update-floor.dto';
import { ResourceNotFoundException } from '../../../common/exceptions/custom.exception';

@Injectable()
export class FloorsService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.floor.findMany({
      include: { tables: true },
    });
  }

  async findById(id: string) {
    const floor = await this.prisma.floor.findUnique({
      where: { id },
      include: { tables: true },
    });

    if (!floor) {
      throw new ResourceNotFoundException('Floor');
    }

    return floor;
  }

  async create(createFloorDto: CreateFloorDto) {
    return this.prisma.floor.create({
      data: createFloorDto,
    });
  }

  async update(id: string, updateFloorDto: UpdateFloorDto) {
    const floor = await this.prisma.floor.findUnique({ where: { id } });

    if (!floor) {
      throw new ResourceNotFoundException('Floor');
    }

    return this.prisma.floor.update({
      where: { id },
      data: updateFloorDto,
      include: { tables: true },
    });
  }

  async delete(id: string) {
    const floor = await this.prisma.floor.findUnique({ where: { id } });

    if (!floor) {
      throw new ResourceNotFoundException('Floor');
    }

    return this.prisma.floor.delete({
      where: { id },
    });
  }
}
