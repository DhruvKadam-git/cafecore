import {
    Injectable,
    Logger,
    ConflictException,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenSessionDto } from './dto/open-session.dto';
import { CloseSessionDto } from './dto/close-session.dto';
import { SessionFilterDto } from './dto/session-filter.dto';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Service for managing POS sessions
 * Handles session lifecycle: open, close, and session management
 */
@Injectable()
export class SessionsService {
    private readonly logger = new Logger(SessionsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Open a new POS session for the logged-in user
     * @param userId - User ID of the employee opening the session
     * @param openSessionDto - Session opening data
     * @returns Created session
     * @throws ConflictException if employee already has an open session
     */
    async openSession(userId: string, openSessionDto: OpenSessionDto) {
        this.logger.log(`Opening session for user: ${userId}`);

        // Check if user already has an open session
        const existingSession = await this.prisma.session.findFirst({
            where: {
                openedByUserId: userId,
                status: 'OPEN',
            },
        });

        if (existingSession) {
            this.logger.warn(`User already has open session: ${userId}`);
            throw new ConflictException(
                'You already have an open session. Please close it before opening a new one.',
            );
        }

        // Create new session
        const session = await this.prisma.session.create({
            data: {
                openedByUserId: userId,
                status: 'OPEN',
                openingAmount: openSessionDto.openingAmount
                    ? new Decimal(openSessionDto.openingAmount)
                    : null,
                totalOrders: 0,
                totalSales: new Decimal(0),
            },
            include: {
                openedByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        this.logger.log(`Session opened successfully: ${session.id}`);

        return {
            message: 'Session opened successfully',
            session,
        };
    }

    /**
     * Get current open session for logged-in user
     * @param userId - User ID of the employee
     * @returns Current open session
     * @throws NotFoundException if no open session found
     */
    async getCurrentSession(userId: string) {
        this.logger.debug(`Fetching current session for user: ${userId}`);

        const session = await this.prisma.session.findFirst({
            where: {
                openedByUserId: userId,
                status: 'OPEN',
            },
            include: {
                openedByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!session) {
            this.logger.warn(`No open session found for user: ${userId}`);
            throw new NotFoundException(
                'No active session found. Please open a session first.',
            );
        }

        return session;
    }

    /**
     * Get session by ID
     * @param sessionId - Session ID
     * @param userId - User ID (for permission check)
     * @returns Session details
     * @throws NotFoundException if session not found
     */
    async getSession(sessionId: string, userId: string) {
        this.logger.debug(`Fetching session: ${sessionId}`);

        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                openedByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                orders: {
                    where: { status: 'COMPLETED' },
                    select: { id: true },
                },
            },
        });

        if (!session) {
            this.logger.warn(`Session not found: ${sessionId}`);
            throw new NotFoundException(`Session with ID "${sessionId}" not found`);
        }

        // Check permission: user can only see their own sessions
        if (session.openedByUserId !== userId) {
            this.logger.warn(
                `User ${userId} trying to access session of user ${session.openedByUserId}`,
            );
            throw new ForbiddenException(
                'You can only view your own sessions',
            );
        }

        return session;
    }

    /**
     * Close a POS session
     * @param sessionId - Session ID to close
     * @param userId - User ID (for permission check)
     * @param closeSessionDto - Session closing data
     * @returns Closed session
     * @throws NotFoundException if session not found
     * @throws ConflictException if session already closed
     * @throws ForbiddenException if user is not the session opener
     */
    async closeSession(
        sessionId: string,
        userId: string,
        closeSessionDto: CloseSessionDto,
    ) {
        this.logger.log(`Closing session: ${sessionId} by user: ${userId}`);

        // Fetch session
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            this.logger.warn(`Session not found: ${sessionId}`);
            throw new NotFoundException(`Session with ID "${sessionId}" not found`);
        }

        // Check permission
        if (session.openedByUserId !== userId) {
            this.logger.warn(
                `User ${userId} trying to close session opened by ${session.openedByUserId}`,
            );
            throw new ForbiddenException(
                'You can only close your own sessions',
            );
        }

        // Check if session is already closed
        if (session.status === 'CLOSED') {
            this.logger.warn(`Session already closed: ${sessionId}`);
            throw new ConflictException('This session is already closed');
        }

        // Calculate total sales from completed orders
        const completedOrders = await this.prisma.order.findMany({
            where: {
                sessionId,
                status: 'COMPLETED',
                payments: {
                    some: {
                        status: 'COMPLETED',
                    },
                },
            },
            include: {
                payments: true,
            },
        });

        const totalSales = completedOrders.reduce((sum, order) => {
            return sum + (order.payments[0]?.amount || 0);
        }, 0);

        // Close session
        const closedSession = await this.prisma.session.update({
            where: { id: sessionId },
            data: {
                status: 'CLOSED',
                closingAmount: new Decimal(closeSessionDto.closingAmount),
                totalSales: new Decimal(totalSales),
                totalOrders: completedOrders.length,
                closedAt: new Date(),
            },
            include: {
                openedByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        this.logger.log(`Session closed successfully: ${sessionId}`);

        return {
            message: 'Session closed successfully',
            session: closedSession,
        };
    }

    /**
     * Get session summary (for closing screen)
     * @param sessionId - Session ID
     * @param userId - User ID (for permission check)
     * @returns Session summary
     */
    async getSessionSummary(sessionId: string, userId: string) {
        this.logger.debug(`Fetching session summary: ${sessionId}`);

        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            this.logger.warn(`Session not found: ${sessionId}`);
            throw new NotFoundException(`Session with ID "${sessionId}" not found`);
        }

        // Check permission
        if (session.openedByUserId !== userId) {
            this.logger.warn(
                `User ${userId} trying to access summary of session opened by ${session.openedByUserId}`,
            );
            throw new ForbiddenException(
                'You can only view your own session summaries',
            );
        }

        return {
            sessionId: session.id,
            openedAt: session.openedAt,
            closedAt: session.closedAt,
            totalOrders: session.totalOrders,
            totalSales: session.totalSales,
            openingAmount: session.openingAmount,
            closingAmount: session.closingAmount,
            status: session.status,
        };
    }

    /**
     * Get paginated session history (ADMIN only)
     * @param filterDto - Pagination and filter parameters
     * @returns Paginated session list
     */
    async getSessionHistory(filterDto: SessionFilterDto) {
        const { status = undefined, page = 1, limit = 10 } = filterDto;
        const skip = (page - 1) * limit;

        this.logger.debug(
            `Fetching session history - status: ${status}, page: ${page}, limit: ${limit}`,
        );

        const where = status ? { status } : {};

        const [sessions, total] = await Promise.all([
            this.prisma.session.findMany({
                where,
                skip,
                take: limit,
                include: {
                    openedByUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { openedAt: 'desc' },
            }),
            this.prisma.session.count({ where }),
        ]);

        this.logger.debug(
            `Found ${sessions.length} sessions out of ${total} total`,
        );

        return {
            data: sessions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get dashboard data (before entering POS)
     * @param userId - User ID
     * @returns Last session date and last closing amount
     */
    async getDashboardData(userId: string) {
        this.logger.debug(`Fetching dashboard data for user: ${userId}`);

        // Get last closed session
        const lastClosedSession = await this.prisma.session.findFirst({
            where: {
                openedByUserId: userId,
                status: 'CLOSED',
            },
            orderBy: { closedAt: 'desc' },
            select: {
                closedAt: true,
                closingAmount: true,
            },
        });

        // Get current open session
        const currentSession = await this.prisma.session.findFirst({
            where: {
                openedByUserId: userId,
                status: 'OPEN',
            },
            select: {
                status: true,
            },
        });

        return {
            lastSessionDate: lastClosedSession?.closedAt || null,
            lastClosingAmount: lastClosedSession?.closingAmount || null,
            currentSessionStatus: currentSession?.status || null,
        };
    }
}
