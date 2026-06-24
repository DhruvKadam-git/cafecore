import { Module } from '@nestjs/common';
import { KdsService } from './services/kds.service';
import { KdsController } from './kds.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [KdsService, PrismaService],
  controllers: [KdsController],
  exports: [KdsService],
})
export class KdsModule {}
