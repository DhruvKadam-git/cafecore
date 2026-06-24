import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto } from '../dto/create-session.dto';
import { ResourceNotFoundException } from '../../../common/exceptions/custom.exception';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.session.findMany({
      select: {
        id: true,
        userId: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        closedAt: true,
      },
    });
  }

  async findById(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        closedAt: true,
      },
    });

    if (!session) {
      throw new ResourceNotFoundException('Session');
    }

    return session;
  }

  async create(createSessionDto: CreateSessionDto) {
    return this.prisma.session.create({
      data: {
        userId: createSessionDto.userId,
        description: createSessionDto.description,
        status: 'active',
      },
      select: {
        id: true,
        userId: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        closedAt: true,
      },
    });
  }

  async closeSession(id: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });

    if (!session) {
      throw new ResourceNotFoundException('Session');
    }

    return this.prisma.session.update({
      where: { id },
      data: {
        status: 'closed',
        closedAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        closedAt: true,
      },
    });
  }

  async delete(id: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });

    if (!session) {
      throw new ResourceNotFoundException('Session');
    }

    return this.prisma.session.delete({
      where: { id },
    });
  }
}
