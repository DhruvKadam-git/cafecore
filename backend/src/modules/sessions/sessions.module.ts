import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Sessions Module
 * Manages all POS session-related operations
 * Exports SessionsService for use in other modules (e.g., Orders module)
 */
@Module({
  imports: [PrismaModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule { }
