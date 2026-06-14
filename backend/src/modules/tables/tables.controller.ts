import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Tables Management Controller
 * Handles all HTTP requests related to restaurant tables
 * Requires JWT authentication
 */
@ApiTags('Tables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tables')
export class TablesController {
  private readonly logger = new Logger(TablesController.name);

  constructor(private readonly tablesService: TablesService) { }

  /**
   * Create a new table
   * Only ADMIN can create tables
   */
  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary: 'Create Table',
    description: 'Create a new restaurant table (ADMIN only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Table created successfully',
    schema: {
      example: {
        id: 't1-uuid',
        floorId: 'f1-uuid',
        tableNumber: 'T1',
        seats: 4,
        status: 'AVAILABLE',
        isActive: true,
        createdAt: '2024-06-13T10:30:00Z',
        updatedAt: '2024-06-13T10:30:00Z',
        floor: {
          id: 'f1-uuid',
          name: 'Ground Floor',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Floor not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Floor with ID "invalid-floor-id" not found',
        error: 'Not Found',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input (floor archived or invalid seats)',
    schema: {
      example: {
        statusCode: 400,
        message: 'Table must have at least 1 seat',
        error: 'Bad Request',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Table number already exists on floor',
    schema: {
      example: {
        statusCode: 409,
        message: 'Table "T1" already exists on floor "Ground Floor"',
        error: 'Conflict',
      },
    },
  })
  async create(@Body() createTableDto: CreateTableDto) {
    this.logger.log(
      `Creating table: ${createTableDto.tableNumber} on floor ${createTableDto.floorId}`,
    );
    return this.tablesService.create(createTableDto);
  }

  /**
   * Get all tables with optional filters
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List Tables',
    description: 'Get all active tables with optional filters',
  })
  @ApiQuery({
    name: 'floorId',
    required: false,
    description: 'Filter by floor ID',
    example: 'f1-uuid',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by table status',
    enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'],
    example: 'AVAILABLE',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tables',
    schema: {
      example: [
        {
          id: 't1-uuid',
          tableNumber: 'T1',
          seats: 4,
          status: 'AVAILABLE',
          isActive: true,
          floor: {
            id: 'f1-uuid',
            name: 'Ground Floor',
          },
        },
        {
          id: 't2-uuid',
          tableNumber: 'T2',
          seats: 2,
          status: 'OCCUPIED',
          isActive: true,
          floor: {
            id: 'f1-uuid',
            name: 'Ground Floor',
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid status',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid status. Must be AVAILABLE, OCCUPIED, or RESERVED',
        error: 'Bad Request',
      },
    },
  })
  async findAll(
    @Query('floorId') floorId?: string,
    @Query('status') status?: string,
  ) {
    this.logger.log(`Fetching tables - floorId: ${floorId}, status: ${status}`);
    return this.tablesService.findAll(floorId, status);
  }

  /**
   * Get a specific table by ID
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Table',
    description: 'Get a specific table by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Table ID',
    example: 't1-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Table details',
    schema: {
      example: {
        id: 't1-uuid',
        tableNumber: 'T1',
        seats: 4,
        status: 'AVAILABLE',
        isActive: true,
        floor: {
          id: 'f1-uuid',
          name: 'Ground Floor',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Table not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Table with ID "invalid-id" not found',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching table: ${id}`);
    return this.tablesService.findOne(id);
  }

  /**
   * Update table information
   * Only ADMIN can update tables
   */
  @Roles('ADMIN')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary: 'Update Table',
    description: 'Update table information (ADMIN only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Table ID',
    example: 't1-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Table updated successfully',
    schema: {
      example: {
        id: 't1-uuid',
        tableNumber: 'T1',
        seats: 6,
        status: 'AVAILABLE',
        isActive: true,
        floor: {
          id: 'f1-uuid',
          name: 'Ground Floor',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Table not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
  })
  @ApiConflictResponse({
    description: 'Table number already exists on floor',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    this.logger.log(`Updating table: ${id}`);
    return this.tablesService.update(id, updateTableDto);
  }

  /**
   * Update table status
   * ADMIN can change status, EMPLOYEE can only update specific statuses
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update Table Status',
    description: 'Update table status (AVAILABLE, OCCUPIED, RESERVED)',
  })
  @ApiParam({
    name: 'id',
    description: 'Table ID',
    example: 't1-uuid',
  })
  @ApiParam({
    name: 'status',
    description: 'New status',
    enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'],
    example: 'OCCUPIED',
  })
  @ApiResponse({
    status: 200,
    description: 'Table status updated',
    schema: {
      example: {
        id: 't1-uuid',
        tableNumber: 'T1',
        seats: 4,
        status: 'OCCUPIED',
        isActive: true,
        floor: {
          id: 'f1-uuid',
          name: 'Ground Floor',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Table not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid status',
  })
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED',
  ) {
    this.logger.log(`Updating table status: ${id} -> ${status}`);
    return this.tablesService.updateStatus(id, status);
  }

  /**
   * Delete (soft delete) a table
   * Only ADMIN can delete tables
   */
  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Table',
    description: 'Soft delete a table (set isActive to false) - ADMIN only',
  })
  @ApiParam({
    name: 'id',
    description: 'Table ID',
    example: 't1-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Table deleted successfully',
    schema: {
      example: {
        id: 't1-uuid',
        tableNumber: 'T1',
        seats: 4,
        status: 'AVAILABLE',
        isActive: false,
        floor: {
          id: 'f1-uuid',
          name: 'Ground Floor',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Table not found',
  })
  @ApiBadRequestResponse({
    description: 'Cannot delete table with active orders',
    schema: {
      example: {
        statusCode: 400,
        message: 'Cannot delete table with 1 active order(s). Complete orders first.',
        error: 'Bad Request',
      },
    },
  })
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting table: ${id}`);
    return this.tablesService.remove(id);
  }
}
