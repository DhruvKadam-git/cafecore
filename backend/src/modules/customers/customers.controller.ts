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
  ApiBadRequestResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerFilterDto } from './dto/customer-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Customers Management Controller
 * Handles all HTTP requests related to customers
 * Requires JWT authentication
 */
@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);

  constructor(private readonly customersService: CustomersService) { }

  /**
   * Create a new customer
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary: 'Create Customer',
    description: 'Create a new customer in the system',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    schema: {
      example: {
        message: 'Customer created successfully',
        customer: {
          id: 'cust-uuid',
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '9876543210',
          isActive: true,
          createdAt: '2024-06-13T10:30:00Z',
          updatedAt: '2024-06-13T10:30:00Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or invalid data',
    schema: {
      example: {
        statusCode: 400,
        message: 'At least one of email or phone number must be provided',
        error: 'Bad Request',
      },
    },
  })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    this.logger.log(`Creating customer: ${createCustomerDto.name}`);
    return this.customersService.create(createCustomerDto);
  }

  /**
   * Get all customers with pagination and search
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List Customers',
    description: 'Get all customers with optional pagination and search',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name, email, or phone number (case-insensitive)',
    example: 'john',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Records per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of customers',
    schema: {
      example: {
        data: [
          {
            id: 'cust-uuid-1',
            name: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '9876543210',
            isActive: true,
            createdAt: '2024-06-13T10:30:00Z',
            updatedAt: '2024-06-13T10:30:00Z',
          },
          {
            id: 'cust-uuid-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            phoneNumber: '8765432109',
            isActive: true,
            createdAt: '2024-06-13T10:35:00Z',
            updatedAt: '2024-06-13T10:35:00Z',
          },
        ],
        total: 50,
        page: 1,
        limit: 10,
        totalPages: 5,
      },
    },
  })
  async findAll(@Query() filterDto: CustomerFilterDto) {
    this.logger.log(
      `Fetching customers - search: ${filterDto.search}, page: ${filterDto.page}`,
    );
    return this.customersService.findAll(filterDto);
  }

  /**
   * POS optimized customer search endpoint
   * Used for customer selection dropdown in POS
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get('pos-search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'POS Customer Search',
    description:
      'Fast customer search optimized for POS customer selection popup',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Search query (name, email, or phone)',
    example: 'john',
  })
  @ApiResponse({
    status: 200,
    description: 'List of matching customers',
    schema: {
      example: [
        {
          id: 'cust-uuid-1',
          name: 'John Doe',
          phoneNumber: '9876543210',
        },
        {
          id: 'cust-uuid-2',
          name: 'John Smith',
          phoneNumber: '8765432109',
        },
      ],
    },
  })
  async posSearch(@Query('query') query: string) {
    this.logger.log(`POS search for: ${query}`);
    return this.customersService.posSearch(query);
  }

  /**
   * Get a specific customer by ID
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Customer',
    description: 'Get a specific customer by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    example: 'cust-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer details',
    schema: {
      example: {
        id: 'cust-uuid',
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '9876543210',
        isActive: true,
        createdAt: '2024-06-13T10:30:00Z',
        updatedAt: '2024-06-13T10:30:00Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Customer not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Customer with ID "cust-uuid" not found',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching customer: ${id}`);
    return this.customersService.findOne(id);
  }

  /**
   * Update customer information
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary: 'Update Customer',
    description: 'Update customer information (partial update allowed)',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    example: 'cust-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    schema: {
      example: {
        message: 'Customer updated successfully',
        customer: {
          id: 'cust-uuid',
          name: 'John Doe',
          email: 'john.updated@example.com',
          phoneNumber: '9999999999',
          isActive: true,
          createdAt: '2024-06-13T10:30:00Z',
          updatedAt: '2024-06-13T10:40:00Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Customer not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid data provided',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    this.logger.log(`Updating customer: ${id}`);
    return this.customersService.update(id, updateCustomerDto);
  }

  /**
   * Delete (soft delete) a customer
   * Only ADMIN can delete customers
   */
  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Customer',
    description: 'Archive a customer (soft delete - ADMIN only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    example: 'cust-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer archived successfully',
    schema: {
      example: {
        message: 'Customer archived successfully',
        customer: {
          id: 'cust-uuid',
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '9876543210',
          isActive: false,
          createdAt: '2024-06-13T10:30:00Z',
          updatedAt: '2024-06-13T10:45:00Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Customer not found',
  })
  async remove(@Param('id') id: string) {
    this.logger.log(`Archiving customer: ${id}`);
    return this.customersService.remove(id);
  }
}
