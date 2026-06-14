import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  Request,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Orders Management Controller
 * Handles all HTTP requests related to orders
 * Requires JWT authentication
 */
@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) { }

  /**
   * Create a new order
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary: 'Create Order',
    description: 'Create a new order with items. Only DRAFT orders can be created.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    schema: {
      example: {
        message: 'Order created successfully',
        order: {
          id: 'order-uuid',
          orderNumber: 'ORD-20260613-103000-ABC12',
          sessionId: 'session-uuid',
          tableId: 'table-uuid',
          customerId: null,
          createdByUserId: 'user-uuid',
          status: 'DRAFT',
          subtotal: 500,
          taxTotal: 50,
          discountTotal: 0,
          grandTotal: 550,
          notes: null,
          sentToKitchenAt: null,
          paidAt: null,
          createdAt: '2024-06-13T10:30:00Z',
          updatedAt: '2024-06-13T10:30:00Z',
          orderItems: [
            {
              id: 'item-uuid',
              orderId: 'order-uuid',
              productId: 'product-uuid',
              productNameSnapshot: 'Espresso',
              unitPriceSnapshot: 250,
              taxRateSnapshot: 5,
              quantity: 2,
              lineSubtotal: 500,
              lineTax: 25,
              lineDiscount: 0,
              lineTotal: 525,
              kdsStatus: 'PENDING',
            },
          ],
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation error or session not OPEN',
    schema: {
      example: {
        statusCode: 400,
        message: 'Session must be OPEN to create orders',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Session, table, or product not found',
  })
  async create(@Request() req: any, @Body() createOrderDto: CreateOrderDto) {
    this.logger.log(`Creating order for user: ${req.user.id}`);
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  /**
   * Get all orders with pagination and filters
   * ADMIN sees all orders, EMPLOYEE sees only their orders
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Orders',
    description: 'Get paginated orders with filters (ADMIN sees all, EMPLOYEE sees own)',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders list',
    schema: {
      example: {
        data: [
          {
            id: 'order-uuid',
            orderNumber: 'ORD-20260613-103000-ABC12',
            status: 'DRAFT',
            subtotal: 500,
            taxTotal: 50,
            discountTotal: 0,
            grandTotal: 550,
            createdAt: '2024-06-13T10:30:00Z',
          },
        ],
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
      },
    },
  })
  async findAll(
    @Query() filterDto: OrderFilterDto,
    @Request() req: any,
  ) {
    this.logger.log(`Fetching orders for user: ${req.user.id}`);
    return this.ordersService.findAll(
      filterDto,
      req.user.id,
      req.user.role,
    );
  }

  /**
   * Get order by ID
   * ADMIN sees all, EMPLOYEE sees only their orders
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Order',
    description: 'Get order details by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: 'order-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Order details',
    schema: {
      example: {
        id: 'order-uuid',
        orderNumber: 'ORD-20260613-103000-ABC12',
        sessionId: 'session-uuid',
        tableId: 'table-uuid',
        status: 'DRAFT',
        subtotal: 500,
        taxTotal: 50,
        discountTotal: 0,
        grandTotal: 550,
        orderItems: [],
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Order not found or access denied',
  })
  @ApiForbiddenResponse({
    description: 'User cannot access this order',
  })
  async findOne(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Fetching order: ${id}`);
    return this.ordersService.findOne(id, req.user.id, req.user.role);
  }

  /**
   * Update order
   * Only DRAFT orders can be updated
   * ADMIN can update any order, EMPLOYEE can update only their orders
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary: 'Update Order',
    description: 'Update order (only DRAFT orders can be updated)',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: 'order-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    schema: {
      example: {
        message: 'Order updated successfully',
        order: {
          id: 'order-uuid',
          status: 'DRAFT',
          notes: 'Updated notes',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  @ApiConflictResponse({
    description: 'Only DRAFT orders can be updated',
  })
  @ApiForbiddenResponse({
    description: 'User cannot update this order',
  })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    this.logger.log(`Updating order: ${id}`);
    return this.ordersService.update(
      id,
      req.user.id,
      req.user.role,
      updateOrderDto,
    );
  }

  /**
   * Delete order
   * Only DRAFT orders can be deleted (soft delete - status set to CANCELLED)
   * ADMIN can delete any order, EMPLOYEE can delete only their orders
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Order',
    description: 'Delete order (only DRAFT orders can be deleted, soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: 'order-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Order archived successfully',
    schema: {
      example: {
        message: 'Order archived successfully',
        order: {
          id: 'order-uuid',
          status: 'CANCELLED',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  @ApiConflictResponse({
    description: 'Only DRAFT orders can be deleted',
  })
  @ApiForbiddenResponse({
    description: 'User cannot delete this order',
  })
  async remove(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Deleting order: ${id}`);
    return this.ordersService.remove(id, req.user.id, req.user.role);
  }

  /**
   * Send order to kitchen
   * Changes status from DRAFT to SENT_TO_KITCHEN
   * Used after order is finalized and ready for kitchen
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Post(':id/send-to-kitchen')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary: 'Send Order To Kitchen',
    description: 'Send order to kitchen (status: DRAFT → SENT_TO_KITCHEN)',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: 'order-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Order sent to kitchen successfully',
    schema: {
      example: {
        message: 'Order sent to kitchen successfully',
        order: {
          id: 'order-uuid',
          status: 'SENT_TO_KITCHEN',
          sentToKitchenAt: '2024-06-13T10:35:00Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  @ApiBadRequestResponse({
    description: 'Order must have at least one item',
  })
  @ApiConflictResponse({
    description: 'Only DRAFT orders can be sent to kitchen',
  })
  @ApiForbiddenResponse({
    description: 'User cannot send this order to kitchen',
  })
  async sendToKitchen(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Sending order to kitchen: ${id}`);
    return this.ordersService.sendToKitchen(id, req.user.id, req.user.role);
  }

  /**
   * Cancel order
   * Changes status to CANCELLED
   * Cannot cancel COMPLETED or PAID orders
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary: 'Cancel Order',
    description: 'Cancel an order (cannot cancel COMPLETED or PAID)',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: 'order-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    schema: {
      example: {
        message: 'Order cancelled successfully',
        order: {
          id: 'order-uuid',
          status: 'CANCELLED',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  @ApiConflictResponse({
    description: 'Cannot cancel COMPLETED or PAID orders',
  })
  @ApiForbiddenResponse({
    description: 'User cannot cancel this order',
  })
  async cancelOrder(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Cancelling order: ${id}`);
    return this.ordersService.cancelOrder(id, req.user.id, req.user.role);
  }

  /**
   * Get current session orders
   * Returns all active orders for current session
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get('session/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Session Orders',
    description: 'Get all active orders for a specific session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'session-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders in session',
    schema: {
      example: {
        data: [
          {
            id: 'order-uuid-1',
            orderNumber: 'ORD-20260613-103000-ABC12',
            status: 'DRAFT',
          },
        ],
        total: 5,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Session not found',
  })
  async getSessionOrders(
    @Param('sessionId') sessionId: string,
    @Request() req: any,
  ) {
    this.logger.log(`Fetching session orders: ${sessionId}`);
    return this.ordersService.getSessionOrders(
      sessionId,
      req.user.role,
      req.user.id,
    );
  }

  /**
   * Get active order for table
   * Returns the current active order on a table
   * Used by POS to show current table order
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get('table/:tableId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Table Order',
    description: 'Get active order for a specific table (used by POS)',
  })
  @ApiParam({
    name: 'tableId',
    description: 'Table ID',
    example: 'table-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Active order for table',
    schema: {
      example: {
        id: 'order-uuid',
        orderNumber: 'ORD-20260613-103000-ABC12',
        status: 'SENT_TO_KITCHEN',
        subtotal: 500,
        taxTotal: 50,
        grandTotal: 550,
        orderItems: [],
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Table not found or no active order',
  })
  async getTableOrder(@Param('tableId') tableId: string) {
    this.logger.log(`Fetching active order for table: ${tableId}`);
    const order = await this.ordersService.getTableOrder(tableId);

    if (!order) {
      throw new NotFoundException(
        `No active order found for table "${tableId}"`,
      );
    }

    return order;
  }
}
