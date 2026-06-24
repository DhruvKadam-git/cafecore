import { Module } from '@nestjs/common';
import { CustomersService } from './services/customers.service';
import { CustomersController } from './customers.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [CustomersService, PrismaService],
  controllers: [CustomersController],
  exports: [CustomersService],
})
export class CustomersModule {}
