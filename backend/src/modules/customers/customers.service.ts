import {
    Injectable,
    Logger,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerFilterDto } from './dto/customer-filter.dto';

/**
 * Service for managing customers
 * Handles CRUD operations and business logic
 */
@Injectable()
export class CustomersService {
    private readonly logger = new Logger(CustomersService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a new customer
     * @param createCustomerDto - Customer creation data
     * @returns Created customer object
     * @throws BadRequestException if email or phone invalid
     */
    async create(createCustomerDto: CreateCustomerDto) {
        this.logger.log(`Creating new customer: ${createCustomerDto.name}`);

        // Validate that at least one of email or phone exists
        if (!createCustomerDto.email && !createCustomerDto.phoneNumber) {
            this.logger.warn('Customer creation failed: No email or phone number provided');
            throw new BadRequestException(
                'At least one of email or phone number must be provided',
            );
        }

        // Create customer
        const customer = await this.prisma.customer.create({
            data: {
                name: createCustomerDto.name,
                email: createCustomerDto.email || null,
                phoneNumber: createCustomerDto.phoneNumber || null,
                isActive: true,
            },
        });

        this.logger.log(`Customer created successfully: ${customer.id}`);
        return {
            message: 'Customer created successfully',
            customer,
        };
    }

    /**
     * Get all customers with pagination and search
     * @param filterDto - Filter, search, and pagination parameters
     * @returns Paginated customer list
     */
    async findAll(filterDto: CustomerFilterDto) {
        const { search = '', page = 1, limit = 10 } = filterDto;
        const skip = (page - 1) * limit;

        this.logger.debug(
            `Fetching customers - search: ${search}, page: ${page}, limit: ${limit}`,
        );

        // Build search condition
        const searchCondition = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { phoneNumber: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        // Fetch customers
        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({
                where: {
                    isActive: true,
                    ...searchCondition,
                },
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.customer.count({
                where: {
                    isActive: true,
                    ...searchCondition,
                },
            }),
        ]);

        this.logger.debug(`Found ${customers.length} customers out of ${total} total`);

        return {
            data: customers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get a single customer by ID
     * @param id - Customer ID
     * @returns Customer object if found
     * @throws NotFoundException if customer not found or archived
     */
    async findOne(id: string) {
        this.logger.debug(`Fetching customer: ${id}`);

        const customer = await this.prisma.customer.findUnique({
            where: { id },
        });

        if (!customer) {
            this.logger.warn(`Customer not found: ${id}`);
            throw new NotFoundException(`Customer with ID "${id}" not found`);
        }

        if (!customer.isActive) {
            this.logger.warn(`Customer archived: ${id}`);
            throw new NotFoundException(
                `Customer with ID "${id}" has been archived`,
            );
        }

        return customer;
    }

    /**
     * POS optimized search - returns minimal data for dropdown
     * @param query - Search query (name, email, or phone)
     * @returns Array of customers with id, name, phoneNumber
     */
    async posSearch(query: string) {
        this.logger.debug(`POS search for: ${query}`);

        if (!query || query.trim().length === 0) {
            return [];
        }

        const customers = await this.prisma.customer.findMany({
            where: {
                isActive: true,
                OR: [
                    { name: { contains: query.trim(), mode: 'insensitive' as const } },
                    { email: { contains: query.trim(), mode: 'insensitive' as const } },
                    { phoneNumber: { contains: query.trim(), mode: 'insensitive' as const } },
                ],
            },
            select: {
                id: true,
                name: true,
                phoneNumber: true,
            },
            take: 20, // Limit results for POS dropdown
            orderBy: { name: 'asc' },
        });

        this.logger.debug(`Found ${customers.length} customers for POS search`);
        return customers;
    }

    /**
     * Update customer information
     * @param id - Customer ID
     * @param updateCustomerDto - Updated customer data
     * @returns Updated customer object
     * @throws NotFoundException if customer not found
     * @throws BadRequestException if validation fails
     */
    async update(id: string, updateCustomerDto: UpdateCustomerDto) {
        this.logger.log(`Updating customer: ${id}`);

        // Verify customer exists and is active
        await this.findOne(id);

        // Update customer
        const updatedCustomer = await this.prisma.customer.update({
            where: { id },
            data: {
                ...(updateCustomerDto.name && { name: updateCustomerDto.name }),
                ...(updateCustomerDto.email !== undefined && {
                    email: updateCustomerDto.email || null,
                }),
                ...(updateCustomerDto.phoneNumber !== undefined && {
                    phoneNumber: updateCustomerDto.phoneNumber || null,
                }),
            },
        });

        this.logger.log(`Customer updated successfully: ${id}`);

        return {
            message: 'Customer updated successfully',
            customer: updatedCustomer,
        };
    }

    /**
     * Soft delete a customer (set isActive to false)
     * @param id - Customer ID
     * @returns Updated customer object
     * @throws NotFoundException if customer not found
     */
    async remove(id: string) {
        this.logger.log(`Archiving customer: ${id}`);

        // Verify customer exists
        await this.findOne(id);

        // Soft delete customer
        const archivedCustomer = await this.prisma.customer.update({
            where: { id },
            data: { isActive: false },
        });

        this.logger.log(`Customer archived successfully: ${id}`);

        return {
            message: 'Customer archived successfully',
            customer: archivedCustomer,
        };
    }
}
