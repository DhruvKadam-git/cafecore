import { Module } from '@nestjs/common';
import { TablesService } from './services/tables.service';
import { TablesController } from './tables.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [TablesService, PrismaService],
  controllers: [TablesController],
  exports: [TablesService],
})
export class TablesModule {}
