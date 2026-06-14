import {
    Injectable,
    Logger,
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

/**
 * Service for managing restaurant tables
 * Handles CRUD operations and business logic
 */
@Injectable()
export class TablesService {
    private readonly logger = new Logger(TablesService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new restaurant table
     * @param createTableDto - Table creation data
     * @returns Created table object
     * @throws NotFoundException if floor not found
     * @throws BadRequestException if floor is inactive
     * @throws BadRequestException if seats invalid
     * @throws ConflictException if table number already exists for floor
     */
    async create(createTableDto: CreateTableDto) {
        this.logger.log(
            `Creating new table: ${createTableDto.tableNumber} in floor ${createTableDto.floorId}`,
        );

        // Validate seats
        if (createTableDto.seats < 1) {
            this.logger.warn(`Invalid seat count: ${createTableDto.seats}`);
            throw new BadRequestException('Table must have at least 1 seat');
        }

        // Check if floor exists and is active
        const floor = await this.prisma.floor.findUnique({
            where: { id: createTableDto.floorId },
        });

        if (!floor) {
            this.logger.warn(`Floor not found: ${createTableDto.floorId}`);
            throw new NotFoundException(
                `Floor with ID "${createTableDto.floorId}" not found`,
            );
        }

        if (!floor.isActive) {
            this.logger.warn(`Floor is inactive: ${createTableDto.floorId}`);
            throw new BadRequestException(
                `Floor "${floor.name}" is archived. Cannot add tables to archived floor.`,
            );
        }

        // Check if table number already exists for this floor
        const existingTable = await this.prisma.restaurantTable.findUnique({
            where: {
                floorId_tableNumber: {
                    floorId: createTableDto.floorId,
                    tableNumber: createTableDto.tableNumber,
                },
            },
        });

        if (existingTable) {
            this.logger.warn(
                `Table number already exists: ${createTableDto.tableNumber} in floor ${createTableDto.floorId}`,
            );
            throw new ConflictException(
                `Table "${createTableDto.tableNumber}" already exists on floor "${floor.name}"`,
            );
        }

        // Create new table
        const table = await this.prisma.restaurantTable.create({
            data: {
                floorId: createTableDto.floorId,
                tableNumber: createTableDto.tableNumber,
                seats: createTableDto.seats,
                status: 'AVAILABLE',
                isActive: true,
            },
            include: {
                floor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        this.logger.log(`Table created successfully: ${table.id}`);
        return table;
    }

    /**
     * Get all active tables with optional filters
     * @param floorId - Optional filter by floor ID
     * @param status - Optional filter by status (AVAILABLE, OCCUPIED, RESERVED)
     * @returns Array of tables
     */
    async findAll(floorId?: string, status?: string) {
        this.logger.debug(`Fetching tables - floorId: ${floorId}, status: ${status}`);

        const where: any = { isActive: true };

        if (floorId) {
            where.floorId = floorId;
        }

        if (status) {
            if (!['AVAILABLE', 'OCCUPIED', 'RESERVED'].includes(status)) {
                this.logger.warn(`Invalid status: ${status}`);
                throw new BadRequestException(
                    'Invalid status. Must be AVAILABLE, OCCUPIED, or RESERVED',
                );
            }
            where.status = status;
        }

        const tables = await this.prisma.restaurantTable.findMany({
            where,
            include: {
                floor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: [{ floor: { sortOrder: 'asc' } }, { tableNumber: 'asc' }],
        });

        this.logger.debug(`Found ${tables.length} tables`);
        return tables;
    }

    /**
     * Get a single table by ID
     * @param id - Table ID
     * @returns Table object if found
     * @throws NotFoundException if table not found
     */
    async findOne(id: string) {
        this.logger.debug(`Fetching table: ${id}`);

        const table = await this.prisma.restaurantTable.findUnique({
            where: { id },
            include: {
                floor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!table) {
            this.logger.warn(`Table not found: ${id}`);
            throw new NotFoundException(`Table with ID "${id}" not found`);
        }

        return table;
    }

    /**
     * Get all tables by floor
     * @param floorId - Floor ID
     * @returns Array of tables on floor
     * @throws NotFoundException if floor not found
     */
    async findByFloor(floorId: string) {
        this.logger.debug(`Fetching tables for floor: ${floorId}`);

        // Verify floor exists
        const floor = await this.prisma.floor.findUnique({
            where: { id: floorId },
        });

        if (!floor) {
            this.logger.warn(`Floor not found: ${floorId}`);
            throw new NotFoundException(`Floor with ID "${floorId}" not found`);
        }

        const tables = await this.prisma.restaurantTable.findMany({
            where: {
                floorId,
                isActive: true,
            },
            orderBy: { tableNumber: 'asc' },
            include: {
                floor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        this.logger.debug(`Found ${tables.length} tables on floor ${floorId}`);
        return tables;
    }

    /**
     * Update table information
     * @param id - Table ID
     * @param updateTableDto - Updated table data
     * @returns Updated table object
     * @throws NotFoundException if table not found
     * @throws BadRequestException if seats invalid
     * @throws ConflictException if new table number already exists
     */
    async update(id: string, updateTableDto: UpdateTableDto) {
        this.logger.log(`Updating table: ${id}`);

        // Verify table exists
        const table = await this.findOne(id);

        // Validate seats if updating
        if (updateTableDto.seats !== undefined && updateTableDto.seats < 1) {
            this.logger.warn(`Invalid seat count: ${updateTableDto.seats}`);
            throw new BadRequestException('Table must have at least 1 seat');
        }

        // Check if new table number already exists (for same floor)
        if (updateTableDto.tableNumber) {
            const existingTable = await this.prisma.restaurantTable.findUnique({
                where: {
                    floorId_tableNumber: {
                        floorId: table.floorId,
                        tableNumber: updateTableDto.tableNumber,
                    },
                },
            });

            if (existingTable && existingTable.id !== id) {
                this.logger.warn(
                    `Table number already exists: ${updateTableDto.tableNumber}`,
                );
                throw new ConflictException(
                    `Table "${updateTableDto.tableNumber}" already exists on this floor`,
                );
            }
        }

        // Update table
        const updatedTable = await this.prisma.restaurantTable.update({
            where: { id },
            data: updateTableDto,
            include: {
                floor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        this.logger.log(`Table updated successfully: ${id}`);
        return updatedTable;
    }

    /**
     * Update table status
     * Convenient method for quick status updates during order operations
     * @param id - Table ID
     * @param status - New status (AVAILABLE, OCCUPIED, RESERVED)
     * @returns Updated table
     * @throws NotFoundException if table not found
     * @throws BadRequestException if invalid status
     */
    async updateStatus(id: string, status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED') {
        this.logger.log(`Updating table status: ${id} -> ${status}`);

        if (!['AVAILABLE', 'OCCUPIED', 'RESERVED'].includes(status)) {
            this.logger.warn(`Invalid status: ${status}`);
            throw new BadRequestException(
                'Invalid status. Must be AVAILABLE, OCCUPIED, or RESERVED',
            );
        }

        // Verify table exists
        await this.findOne(id);

        const updatedTable = await this.prisma.restaurantTable.update({
            where: { id },
            data: { status },
            include: {
                floor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        this.logger.log(`Table status updated: ${id} -> ${status}`);
        return updatedTable;
    }

    /**
     * Soft delete a table (set isActive to false)
     * @param id - Table ID
     * @returns Updated table object
     * @throws NotFoundException if table not found
     * @throws BadRequestException if table has active orders
     */
    async remove(id: string) {
        this.logger.log(`Deleting table: ${id}`);

        // Verify table exists
        await this.findOne(id);

        // Check if table has active orders
        const activeOrdersCount = await this.prisma.order.count({
            where: {
                tableId: id,
                status: {
                    in: ['DRAFT', 'SENT_TO_KITCHEN', 'PREPARING'],
                },
            },
        });

        if (activeOrdersCount > 0) {
            this.logger.warn(
                `Cannot delete table with active orders. Table ID: ${id}, Active orders: ${activeOrdersCount}`,
            );
            throw new BadRequestException(
                `Cannot delete table with ${activeOrdersCount} active order(s). Complete orders first.`,
            );
        }

        // Soft delete table
        const deletedTable = await this.prisma.restaurantTable.update({
            where: { id },
            data: { isActive: false, status: 'AVAILABLE' },
            include: {
                floor: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        this.logger.log(`Table deleted successfully: ${id}`);
        return deletedTable;
    }
}
