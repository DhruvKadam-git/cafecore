import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './services/sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sessions' })
  async findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session by ID' })
  async findById(@Param('id') id: string) {
    return this.sessionsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new session' })
  async create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close session' })
  async closeSession(@Param('id') id: string) {
    return this.sessionsService.closeSession(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete session' })
  async delete(@Param('id') id: string) {
    return this.sessionsService.delete(id);
  }
}
