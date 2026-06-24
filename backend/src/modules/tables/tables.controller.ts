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
import { TablesService } from './services/tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Tables')
@ApiBearerAuth()
@Controller('tables')
@UseGuards(JwtAuthGuard)
export class TablesController {
  constructor(private tablesService: TablesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tables' })
  async findAll() {
    return this.tablesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get table by ID' })
  async findById(@Param('id') id: string) {
    return this.tablesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new table' })
  async create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update table' })
  async update(
    @Param('id') id: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    return this.tablesService.update(id, updateTableDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete table' })
  async delete(@Param('id') id: string) {
    return this.tablesService.delete(id);
  }
}
