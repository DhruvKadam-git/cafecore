import { Module } from '@nestjs/common';
import { CouponsService } from './services/coupons.service';
import { CouponsController } from './coupons.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [CouponsService, PrismaService],
  controllers: [CouponsController],
  exports: [CouponsService],
})
export class CouponsModule {}
