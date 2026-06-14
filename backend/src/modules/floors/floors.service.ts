import {
    Injectable,
    Logger,
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';

/**
 * Service for managing restaurant floors
 * Handles CRUD operations and business logic
 */
@Injectable()
export class FloorsService {
    private readonly logger = new Logger(FloorsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new floor
     * @param createFloorDto - Floor creation data
     * @returns Created floor object
     * @throws ConflictException if floor name already exists
     */
    async create(createFloorDto: CreateFloorDto) {
        this.logger.log(`Creating new floor: ${createFloorDto.name}`);

        // Check if floor name already exists
        const existingFloor = await this.prisma.floor.findUnique({
            where: { name: createFloorDto.name },
        });

        if (existingFloor) {
            this.logger.warn(`Floor name already exists: ${createFloorDto.name}`);
            throw new ConflictException(
                `Floor with name "${createFloorDto.name}" already exists`,
            );
        }

        // Create new floor
        const floor = await this.prisma.floor.create({
            data: {
                name: createFloorDto.name,
                sortOrder: createFloorDto.sortOrder ?? 0,
                isActive: true,
            },
        });

        this.logger.log(`Floor created successfully: ${floor.id}`);
        return floor;
    }

    /**
     * Get all floors sorted by sortOrder
     * @returns Array of all floors
     */
    async findAll() {
        this.logger.debug('Fetching all floors');

        const floors = await this.prisma.floor.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });

        this.logger.debug(`Found ${floors.length} active floors`);
        return floors;
    }

    /**
     * Get a single floor by ID
     * @param id - Floor ID
     * @returns Floor object if found
     * @throws NotFoundException if floor not found
     */
    async findOne(id: string) {
        this.logger.debug(`Fetching floor: ${id}`);

        const floor = await this.prisma.floor.findUnique({
            where: { id },
        });

        if (!floor) {
            this.logger.warn(`Floor not found: ${id}`);
            throw new NotFoundException(`Floor with ID "${id}" not found`);
        }

        return floor;
    }

    /**
     * Get floor with all its tables (used for POS floor popup)
     * @param id - Floor ID
     * @returns Floor with tables
     * @throws NotFoundException if floor not found
     */
    async findWithTables(id: string) {
        this.logger.debug(`Fetching floor with tables: ${id}`);

        const floor = await this.prisma.floor.findUnique({
            where: { id },
            include: {
                tables: {
                    where: { isActive: true },
                    orderBy: { tableNumber: 'asc' },
                    select: {
                        id: true,
                        tableNumber: true,
                        seats: true,
                        status: true,
                        isActive: true,
                    },
                },
            },
        });

        if (!floor) {
            this.logger.warn(`Floor not found: ${id}`);
            throw new NotFoundException(`Floor with ID "${id}" not found`);
        }

        return floor;
    }

    /**
     * Get all floors with their tables (for POS main screen)
     * @returns Array of floors with their tables
     */
    async findAllWithTables() {
        this.logger.debug('Fetching all floors with tables');

        const floors = await this.prisma.floor.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                tables: {
                    where: { isActive: true },
                    orderBy: { tableNumber: 'asc' },
                    select: {
                        id: true,
                        tableNumber: true,
                        seats: true,
                        status: true,
                    },
                },
            },
        });

        this.logger.debug(`Found ${floors.length} floors with tables`);
        return floors;
    }

    /**
     * Update floor information
     * @param id - Floor ID
     * @param updateFloorDto - Updated floor data
     * @returns Updated floor object
     * @throws NotFoundException if floor not found
     * @throws ConflictException if new name already exists
     * @throws BadRequestException if trying to activate archived floor with inactive tables
     */
    async update(id: string, updateFloorDto: UpdateFloorDto) {
        this.logger.log(`Updating floor: ${id}`);

        // Verify floor exists
        await this.findOne(id);

        // If updating name, check uniqueness
        if (updateFloorDto.name) {
            const existingFloor = await this.prisma.floor.findUnique({
                where: { name: updateFloorDto.name },
            });

            if (existingFloor && existingFloor.id !== id) {
                this.logger.warn(
                    `Floor name already exists: ${updateFloorDto.name}`,
                );
                throw new ConflictException(
                    `Floor with name "${updateFloorDto.name}" already exists`,
                );
            }
        }

        // If trying to activate floor with no active tables, warn (but allow)
        if (updateFloorDto.isActive === true) {
            const activeTablesCount = await this.prisma.restaurantTable.count({
                where: {
                    floorId: id,
                    isActive: true,
                },
            });

            if (activeTablesCount === 0) {
                this.logger.warn(
                    `Floor ${id} activated but has no active tables`,
                );
            }
        }

        // Update floor
        const updatedFloor = await this.prisma.floor.update({
            where: { id },
            data: updateFloorDto,
        });

        this.logger.log(`Floor updated successfully: ${id}`);
        return updatedFloor;
    }

    /**
     * Soft delete a floor (set isActive to false)
     * @param id - Floor ID
     * @returns Updated floor object
     * @throws NotFoundException if floor not found
     * @throws BadRequestException if floor has active tables
     */
    async remove(id: string) {
        this.logger.log(`Deleting floor: ${id}`);

        // Verify floor exists
        await this.findOne(id);

        // Check if floor has any active tables
        const activeTablesCount = await this.prisma.restaurantTable.count({
            where: {
                floorId: id,
                isActive: true,
            },
        });

        if (activeTablesCount > 0) {
            this.logger.warn(
                `Cannot delete floor with active tables. Floor ID: ${id}, Active tables: ${activeTablesCount}`,
            );
            throw new BadRequestException(
                `Cannot delete floor with ${activeTablesCount} active table(s). Archive tables first.`,
            );
        }

        // Soft delete floor
        const deletedFloor = await this.prisma.floor.update({
            where: { id },
            data: { isActive: false },
        });

        this.logger.log(`Floor deleted successfully: ${id}`);
        return deletedFloor;
    }
}
