import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Service for managing Orders
 * Core business logic for order creation, updates, and lifecycle management
 */
@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Generate unique order number
     * Format: ORD-YYYYMMDD-HHMMSS-RANDOM
     */
    private generateOrderNumber(): string {
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, '');
        const time = now.toISOString().slice(11, 19).replace(/:/g, '');
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `ORD-${date}-${time}-${random}`;
    }

    /**
     * Create a new order
     * @param userId - User ID of the employee creating the order
     * @param createOrderDto - Order creation data
     * @returns Created order with items
     * @throws NotFoundException if session, table, or product not found
     * @throws BadRequestException if session not OPEN or validation fails
     */
    async createOrder(userId: string, createOrderDto: CreateOrderDto) {
        this.logger.log(
            `Creating order for session: ${createOrderDto.sessionId}, table: ${createOrderDto.tableId}`,
        );

        // Validate session exists and is OPEN
        const session = await this.prisma.session.findUnique({
            where: { id: createOrderDto.sessionId },
        });

        if (!session) {
            this.logger.warn(`Session not found: ${createOrderDto.sessionId}`);
            throw new NotFoundException(
                `Session with ID "${createOrderDto.sessionId}" not found`,
            );
        }

        if (session.status !== 'OPEN') {
            this.logger.warn(
                `Session not open: ${createOrderDto.sessionId}, status: ${session.status}`,
            );
            throw new BadRequestException('Session must be OPEN to create orders');
        }

        // Validate table exists
        const table = await this.prisma.restaurantTable.findUnique({
            where: { id: createOrderDto.tableId },
        });

        if (!table) {
            this.logger.warn(`Table not found: ${createOrderDto.tableId}`);
            throw new NotFoundException(
                `Table with ID "${createOrderDto.tableId}" not found`,
            );
        }

        // Validate customer if provided
        if (createOrderDto.customerId) {
            const customer = await this.prisma.customer.findUnique({
                where: { id: createOrderDto.customerId },
            });

            if (!customer) {
                this.logger.warn(`Customer not found: ${createOrderDto.customerId}`);
                throw new NotFoundException(
                    `Customer with ID "${createOrderDto.customerId}" not found`,
                );
            }
        }

        // Validate and fetch all products
        const productIds = createOrderDto.items.map((item) => item.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        if (products.length !== productIds.length) {
            this.logger.warn(`Some products not found for order`);
            throw new NotFoundException('One or more products not found');
        }

        // Create product map for quick lookup
        const productMap = new Map(products.map((p) => [p.id, p]));

        // Calculate order totals
        let subtotal = new Decimal(0);
        let taxTotal = new Decimal(0);
        let discountTotal = new Decimal(0);

        // Prepare order items with snapshots
        const orderItems = createOrderDto.items.map((item) => {
            const product = productMap.get(item.productId);
            if (!product) {
                throw new NotFoundException(`Product with ID "${item.productId}" not found`);
            }
            const unitPrice = new Decimal(product.price.toString());
            const taxRate = new Decimal(product.taxRate.toString());
            const quantity = new Decimal(item.quantity);

            const lineSubtotal = unitPrice.mul(quantity);
            const lineTax = lineSubtotal.mul(taxRate).div(100);
            const lineTotal = lineSubtotal.add(lineTax);

            subtotal = subtotal.add(lineSubtotal);
            taxTotal = taxTotal.add(lineTax);

            return {
                productId: item.productId,
                productNameSnapshot: product.name,
                unitPriceSnapshot: unitPrice,
                taxRateSnapshot: taxRate,
                quantity: item.quantity,
                lineSubtotal,
                lineTax,
                lineDiscount: new Decimal(0),
                lineTotal,
            };
        });

        const grandTotal = subtotal.add(taxTotal).minus(discountTotal);

        // Create order with items
        const order = await this.prisma.order.create({
            data: {
                orderNumber: this.generateOrderNumber(),
                sessionId: createOrderDto.sessionId,
                tableId: createOrderDto.tableId,
                customerId: createOrderDto.customerId || null,
                createdByUserId: userId,
                status: 'DRAFT',
                subtotal,
                taxTotal,
                discountTotal,
                grandTotal,
                notes: createOrderDto.notes || null,
                orderItems: {
                    create: orderItems,
                },
            },
            include: {
                session: {
                    select: {
                        id: true,
                        status: true,
                        openingAmount: true,
                    },
                },
                table: {
                    select: {
                        id: true,
                        tableNumber: true,
                        floorId: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                    },
                },
                createdByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                orderItems: true,
            },
        });

        this.logger.log(`Order created successfully: ${order.id}`);

        return {
            message: 'Order created successfully',
            order,
        };
    }

    /**
     * Get all orders with pagination and filters
     * @param filterDto - Pagination and filter parameters
     * @param userId - User ID (for permission checks)
     * @param userRole - User role (ADMIN or EMPLOYEE)
     * @returns Paginated orders
     */
    async findAll(filterDto: OrderFilterDto, userId: string, userRole: string) {
        const { page = 1, limit = 10, status, orderNumber, customerId } = filterDto;
        const skip = (page - 1) * limit;

        this.logger.debug(
            `Fetching orders - page: ${page}, limit: ${limit}, status: ${status}`,
        );

        // Build where clause
        const where: any = {};
        if (status) {
            where.status = status;
        }
        if (orderNumber) {
            where.orderNumber = {
                contains: orderNumber,
                mode: 'insensitive',
            };
        }
        if (customerId) {
            where.customerId = customerId;
        }

        // EMPLOYEE can only see their own orders
        if (userRole === 'EMPLOYEE') {
            where.createdByUserId = userId;
        }

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                include: {
                    session: {
                        select: {
                            id: true,
                            status: true,
                            openingAmount: true,
                        },
                    },
                    table: {
                        select: {
                            id: true,
                            tableNumber: true,
                            floorId: true,
                        },
                    },
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            phoneNumber: true,
                        },
                    },
                    createdByUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    orderItems: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);

        this.logger.debug(`Found ${orders.length} orders out of ${total} total`);

        return {
            data: orders,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get order by ID
     * @param id - Order ID
     * @param userId - User ID (for permission check)
     * @param userRole - User role
     * @returns Order details
     */
    async findOne(id: string, userId: string, userRole: string) {
        this.logger.debug(`Fetching order: ${id}`);

        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                session: {
                    select: {
                        id: true,
                        status: true,
                        openingAmount: true,
                        openedByUser: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                table: {
                    select: {
                        id: true,
                        tableNumber: true,
                        floorId: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
                createdByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                orderItems: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            this.logger.warn(`Order not found: ${id}`);
            throw new NotFoundException(`Order with ID "${id}" not found`);
        }

        // Check permission: EMPLOYEE can only view their own orders
        if (userRole === 'EMPLOYEE' && order.createdByUserId !== userId) {
            this.logger.warn(
                `User ${userId} trying to access order of user ${order.createdByUserId}`,
            );
            throw new ForbiddenException('You can only view your own orders');
        }

        return order;
    }

    /**
     * Update order (only DRAFT orders can be updated)
     * @param id - Order ID
     * @param userId - User ID
     * @param userRole - User role
     * @param updateOrderDto - Update data
     * @returns Updated order
     */
    async update(
        id: string,
        userId: string,
        userRole: string,
        updateOrderDto: UpdateOrderDto,
    ) {
        this.logger.log(`Updating order: ${id}`);

        // Fetch order
        const order = await this.prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            this.logger.warn(`Order not found: ${id}`);
            throw new NotFoundException(`Order with ID "${id}" not found`);
        }

        // Check permission
        if (userRole === 'EMPLOYEE' && order.createdByUserId !== userId) {
            this.logger.warn(
                `User ${userId} trying to update order of user ${order.createdByUserId}`,
            );
            throw new ForbiddenException('You can only update your own orders');
        }

        // Only DRAFT orders can be updated
        if (order.status !== 'DRAFT') {
            this.logger.warn(`Cannot update non-DRAFT order: ${id}, status: ${order.status}`);
            throw new ConflictException(
                `Only DRAFT orders can be updated. Current status: ${order.status}`,
            );
        }

        // Update order
        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: {
                notes: updateOrderDto.notes ?? order.notes,
                customerId: updateOrderDto.customerId ?? order.customerId,
            },
            include: {
                session: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
                table: {
                    select: {
                        id: true,
                        tableNumber: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                orderItems: true,
            },
        });

        this.logger.log(`Order updated successfully: ${id}`);

        return {
            message: 'Order updated successfully',
            order: updatedOrder,
        };
    }

    /**
     * Delete order (soft delete - set status to CANCELLED)
     * @param id - Order ID
     * @param userId - User ID
     * @param userRole - User role
     * @returns Deleted order
     */
    async remove(id: string, userId: string, userRole: string) {
        this.logger.log(`Deleting order: ${id}`);

        // Fetch order
        const order = await this.prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            this.logger.warn(`Order not found: ${id}`);
            throw new NotFoundException(`Order with ID "${id}" not found`);
        }

        // Check permission
        if (userRole === 'EMPLOYEE' && order.createdByUserId !== userId) {
            this.logger.warn(
                `User ${userId} trying to delete order of user ${order.createdByUserId}`,
            );
            throw new ForbiddenException('You can only delete your own orders');
        }

        // Only DRAFT orders can be deleted
        if (order.status !== 'DRAFT') {
            this.logger.warn(`Cannot delete non-DRAFT order: ${id}, status: ${order.status}`);
            throw new ConflictException(
                `Only DRAFT orders can be deleted. Current status: ${order.status}`,
            );
        }

        // Soft delete by setting status to CANCELLED
        const deletedOrder = await this.prisma.order.update({
            where: { id },
            data: {
                status: 'CANCELLED',
            },
            include: {
                session: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
                table: {
                    select: {
                        id: true,
                        tableNumber: true,
                    },
                },
                orderItems: true,
            },
        });

        this.logger.log(`Order deleted (soft delete): ${id}`);

        return {
            message: 'Order archived successfully',
            order: deletedOrder,
        };
    }

    /**
     * Send order to kitchen
     * Updates status from DRAFT to SENT_TO_KITCHEN
     * @param id - Order ID
     * @param userId - User ID
     * @param userRole - User role
     * @returns Updated order
     */
    async sendToKitchen(id: string, userId: string, userRole: string) {
        this.logger.log(`Sending order to kitchen: ${id}`);

        // Fetch order
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                orderItems: true,
            },
        });

        if (!order) {
            this.logger.warn(`Order not found: ${id}`);
            throw new NotFoundException(`Order with ID "${id}" not found`);
        }

        // Check permission
        if (userRole === 'EMPLOYEE' && order.createdByUserId !== userId) {
            this.logger.warn(
                `User ${userId} trying to send order of user ${order.createdByUserId} to kitchen`,
            );
            throw new ForbiddenException('You can only send your own orders to kitchen');
        }

        // Order must be DRAFT
        if (order.status !== 'DRAFT') {
            this.logger.warn(
                `Cannot send non-DRAFT order to kitchen: ${id}, status: ${order.status}`,
            );
            throw new ConflictException(
                `Only DRAFT orders can be sent to kitchen. Current status: ${order.status}`,
            );
        }

        // Order must have items
        if (order.orderItems.length === 0) {
            this.logger.warn(`Cannot send order without items to kitchen: ${id}`);
            throw new BadRequestException('Order must contain at least one item');
        }

        // Update order status
        const sentOrder = await this.prisma.order.update({
            where: { id },
            data: {
                status: 'SENT_TO_KITCHEN',
                sentToKitchenAt: new Date(),
            },
            include: {
                session: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
                table: {
                    select: {
                        id: true,
                        tableNumber: true,
                    },
                },
                orderItems: true,
                createdByUser: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        this.logger.log(`Order sent to kitchen successfully: ${id}`);

        return {
            message: 'Order sent to kitchen successfully',
            order: sentOrder,
        };
    }

    /**
     * Cancel order
     * @param id - Order ID
     * @param userId - User ID
     * @param userRole - User role
     * @returns Cancelled order
     */
    async cancelOrder(id: string, userId: string, userRole: string) {
        this.logger.log(`Cancelling order: ${id}`);

        // Fetch order
        const order = await this.prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            this.logger.warn(`Order not found: ${id}`);
            throw new NotFoundException(`Order with ID "${id}" not found`);
        }

        // Check permission
        if (userRole === 'EMPLOYEE' && order.createdByUserId !== userId) {
            this.logger.warn(
                `User ${userId} trying to cancel order of user ${order.createdByUserId}`,
            );
            throw new ForbiddenException('You can only cancel your own orders');
        }

        // Cannot cancel already completed or paid orders
        if (order.status === 'COMPLETED' || order.status === 'PAID' || order.status === 'CANCELLED') {
            this.logger.warn(`Cannot cancel order with status: ${id}, status: ${order.status}`);
            throw new ConflictException(
                `Cannot cancel order with status: ${order.status}`,
            );
        }

        // Update order status to CANCELLED
        const cancelledOrder = await this.prisma.order.update({
            where: { id },
            data: {
                status: 'CANCELLED',
            },
            include: {
                session: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
                table: {
                    select: {
                        id: true,
                        tableNumber: true,
                    },
                },
                orderItems: true,
            },
        });

        this.logger.log(`Order cancelled successfully: ${id}`);

        return {
            message: 'Order cancelled successfully',
            order: cancelledOrder,
        };
    }

    /**
     * Get current session orders
     * Returns all orders for the active session
     * @param sessionId - Session ID
     * @param userRole - User role
     * @param userId - User ID (for employee filtering)
     * @returns Orders in session
     */
    async getSessionOrders(sessionId: string, userRole: string, userId: string) {
        this.logger.debug(`Fetching orders for session: ${sessionId}`);

        // Verify session exists
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            this.logger.warn(`Session not found: ${sessionId}`);
            throw new NotFoundException(`Session with ID "${sessionId}" not found`);
        }

        // Build where clause
        const where: any = {
            sessionId,
            status: { not: 'CANCELLED' },
        };

        // EMPLOYEE can only see their own orders
        if (userRole === 'EMPLOYEE') {
            where.createdByUserId = userId;
        }

        const orders = await this.prisma.order.findMany({
            where,
            include: {
                table: {
                    select: {
                        id: true,
                        tableNumber: true,
                        floorId: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                orderItems: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        this.logger.debug(`Found ${orders.length} orders for session ${sessionId}`);

        return {
            data: orders,
            total: orders.length,
        };
    }

    /**
     * Get active order for table
     * Returns current order (not COMPLETED or CANCELLED) for a specific table
     * @param tableId - Table ID
     * @returns Active order for table
     */
    async getTableOrder(tableId: string) {
        this.logger.debug(`Fetching active order for table: ${tableId}`);

        // Verify table exists
        const table = await this.prisma.restaurantTable.findUnique({
            where: { id: tableId },
        });

        if (!table) {
            this.logger.warn(`Table not found: ${tableId}`);
            throw new NotFoundException(`Table with ID "${tableId}" not found`);
        }

        const order = await this.prisma.order.findFirst({
            where: {
                tableId,
                status: {
                    notIn: ['COMPLETED', 'CANCELLED', 'PAID'],
                },
            },
            include: {
                session: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                orderItems: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
                createdByUser: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!order) {
            this.logger.debug(`No active order found for table: ${tableId}`);
            return null;
        }

        this.logger.debug(`Found active order for table ${tableId}: ${order.id}`);

        return order;
    }
}
