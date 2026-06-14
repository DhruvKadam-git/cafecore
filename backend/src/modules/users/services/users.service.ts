import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ResourceNotFoundException } from '../../../common/exceptions/custom.exception';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ResourceNotFoundException('User');
    }

    return user;
  }

  async findByEmail(email: string) {
    this.logger.debug(`Finding user with email: ${email}`);

    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findActiveById(id: string) {
    this.logger.debug(`Finding active user with ID: ${id}`);

    return this.prisma.user.findFirst({
      where: {
        id,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, name, role } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        role: role ? (String(role) as 'ADMIN' | 'EMPLOYEE') : 'EMPLOYEE',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new ResourceNotFoundException('User');
    }

    const dataToUpdate: any = {};
    if (updateUserDto.name) dataToUpdate.name = updateUserDto.name;
    if (updateUserDto.email) dataToUpdate.email = updateUserDto.email;
    if (updateUserDto.role) dataToUpdate.role = updateUserDto.role;
    if (updateUserDto.status) dataToUpdate.status = updateUserDto.status.toUpperCase();
    if (updateUserDto.password) {
      dataToUpdate.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new ResourceNotFoundException('User');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
