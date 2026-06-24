import { Module } from '@nestjs/common';
import { PromotionsService } from './services/promotions.service';
import { PromotionsController } from './promotions.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PromotionsService, PrismaService],
  controllers: [PromotionsController],
  exports: [PromotionsService],
})
export class PromotionsModule {}
