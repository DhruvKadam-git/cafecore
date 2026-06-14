import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { FloorsService } from './floors.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Floor Management Controller
 * Handles all HTTP requests related to floors
 * Requires JWT authentication
 */
@ApiTags('Floors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('floors')
export class FloorsController {
  private readonly logger = new Logger(FloorsController.name);

  constructor(private readonly floorsService: FloorsService) { }

  /**
   * Create a new floor
   * Only ADMIN can create floors
   */
  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary: 'Create Floor',
    description: 'Create a new floor (ADMIN only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Floor created successfully',
    schema: {
      example: {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Ground Floor',
        sortOrder: 1,
        isActive: true,
        createdAt: '2024-06-13T10:30:00Z',
        updatedAt: '2024-06-13T10:30:00Z',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Floor name already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Floor with name "Ground Floor" already exists',
        error: 'Conflict',
      },
    },
  })
  async create(@Body() createFloorDto: CreateFloorDto) {
    this.logger.log(`Creating floor: ${createFloorDto.name}`);
    return this.floorsService.create(createFloorDto);
  }

  /**
   * Get all active floors
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List Floors',
    description: 'Get all active floors sorted by sortOrder',
  })
  @ApiResponse({
    status: 200,
    description: 'List of floors',
    schema: {
      example: [
        {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          name: 'Ground Floor',
          sortOrder: 1,
          isActive: true,
          createdAt: '2024-06-13T10:30:00Z',
          updatedAt: '2024-06-13T10:30:00Z',
        },
        {
          id: 'a1b2c3d4-e5f6-4789-0abc-def123456789',
          name: 'First Floor',
          sortOrder: 2,
          isActive: true,
          createdAt: '2024-06-13T10:35:00Z',
          updatedAt: '2024-06-13T10:35:00Z',
        },
      ],
    },
  })
  async findAll() {
    this.logger.log('Fetching all floors');
    return this.floorsService.findAll();
  }

  /**
   * Get all floors with their tables
   * Used for POS floor popup screen
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get('with-tables/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Floors with Tables',
    description:
      'Get all active floors with their tables (optimized for POS floor popup)',
  })
  @ApiResponse({
    status: 200,
    description: 'Floors with their tables',
    schema: {
      example: [
        {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          name: 'Ground Floor',
          sortOrder: 1,
          isActive: true,
          tables: [
            {
              id: 't1-uuid',
              tableNumber: 'T1',
              seats: 4,
              status: 'AVAILABLE',
            },
            {
              id: 't2-uuid',
              tableNumber: 'T2',
              seats: 2,
              status: 'OCCUPIED',
            },
          ],
        },
      ],
    },
  })
  async findAllWithTables() {
    this.logger.log('Fetching all floors with tables');
    return this.floorsService.findAllWithTables();
  }

  /**
   * Get a specific floor with its tables
   * Used for individual floor details
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get(':id/with-tables')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Floor with Tables',
    description: 'Get a specific floor with all its tables',
  })
  @ApiParam({
    name: 'id',
    description: 'Floor ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Floor with its tables',
    schema: {
      example: {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Ground Floor',
        sortOrder: 1,
        isActive: true,
        tables: [
          {
            id: 't1-uuid',
            tableNumber: 'T1',
            seats: 4,
            status: 'AVAILABLE',
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Floor not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Floor with ID "invalid-id" not found',
        error: 'Not Found',
      },
    },
  })
  async findWithTables(@Param('id') id: string) {
    this.logger.log(`Fetching floor with tables: ${id}`);
    return this.floorsService.findWithTables(id);
  }

  /**
   * Get a specific floor by ID
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Floor',
    description: 'Get a specific floor by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Floor ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Floor details',
    schema: {
      example: {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Ground Floor',
        sortOrder: 1,
        isActive: true,
        createdAt: '2024-06-13T10:30:00Z',
        updatedAt: '2024-06-13T10:30:00Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Floor not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Floor with ID "invalid-id" not found',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching floor: ${id}`);
    return this.floorsService.findOne(id);
  }

  /**
   * Update floor information
   * Only ADMIN can update floors
   */
  @Roles('ADMIN')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary: 'Update Floor',
    description: 'Update floor information (ADMIN only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Floor ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Floor updated successfully',
    schema: {
      example: {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Ground Floor Updated',
        sortOrder: 2,
        isActive: true,
        createdAt: '2024-06-13T10:30:00Z',
        updatedAt: '2024-06-13T10:40:00Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Floor not found',
  })
  @ApiConflictResponse({
    description: 'Floor name already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateFloorDto: UpdateFloorDto,
  ) {
    this.logger.log(`Updating floor: ${id}`);
    return this.floorsService.update(id, updateFloorDto);
  }

  /**
   * Delete (soft delete) a floor
   * Only ADMIN can delete floors
   */
  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Floor',
    description: 'Soft delete a floor (set isActive to false) - ADMIN only',
  })
  @ApiParam({
    name: 'id',
    description: 'Floor ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Floor deleted successfully',
    schema: {
      example: {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Ground Floor',
        sortOrder: 1,
        isActive: false,
        createdAt: '2024-06-13T10:30:00Z',
        updatedAt: '2024-06-13T10:45:00Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Floor not found',
  })
  @ApiBadRequestResponse({
    description: 'Cannot delete floor with active tables',
    schema: {
      example: {
        statusCode: 400,
        message: 'Cannot delete floor with 3 active table(s). Archive tables first.',
        error: 'Bad Request',
      },
    },
  })
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting floor: ${id}`);
    return this.floorsService.remove(id);
  }
}
