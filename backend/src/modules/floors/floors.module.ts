import { Module } from '@nestjs/common';
import { FloorsService } from './services/floors.service';
import { FloorsController } from './floors.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [FloorsService, PrismaService],
  controllers: [FloorsController],
  exports: [FloorsService],
})
export class FloorsModule {}
