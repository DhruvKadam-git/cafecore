import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FloorsService } from './services/floors.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Floors')
@ApiBearerAuth()
@Controller('floors')
@UseGuards(JwtAuthGuard)
export class FloorsController {
  constructor(private floorsService: FloorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all floors' })
  async findAll() {
    return this.floorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get floor by ID' })
  async findById(@Param('id') id: string) {
    return this.floorsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new floor' })
  async create(@Body() createFloorDto: CreateFloorDto) {
    return this.floorsService.create(createFloorDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update floor' })
  async update(
    @Param('id') id: string,
    @Body() updateFloorDto: UpdateFloorDto,
  ) {
    return this.floorsService.update(id, updateFloorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete floor' })
  async delete(@Param('id') id: string) {
    return this.floorsService.delete(id);
  }
}
