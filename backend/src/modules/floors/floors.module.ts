import { Module } from '@nestjs/common';
import { FloorsService } from './floors.service';
import { FloorsController } from './floors.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Floors Module
 * Manages all floor-related operations
 * Exports FloorsService for use in other modules (e.g., Tables module)
 */
@Module({
  imports: [PrismaModule],
  controllers: [FloorsController],
  providers: [FloorsService],
  exports: [FloorsService],
})
export class FloorsModule { }
