import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Tables Module
 * Manages all restaurant table-related operations
 * Exports TablesService for use in other modules (e.g., Orders module)
 */
@Module({
  imports: [PrismaModule],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule { }
