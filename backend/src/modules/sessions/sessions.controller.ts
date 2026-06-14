import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  Request,
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
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { OpenSessionDto } from './dto/open-session.dto';
import { CloseSessionDto } from './dto/close-session.dto';
import { SessionFilterDto } from './dto/session-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Sessions Management Controller
 * Handles all HTTP requests related to POS sessions
 * Requires JWT authentication
 */
@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sessions')
export class SessionsController {
  private readonly logger = new Logger(SessionsController.name);

  constructor(private readonly sessionsService: SessionsService) { }

  /**
   * Open a new POS session
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Post('open')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary: 'Open Session',
    description: 'Open a new POS session for the current user',
  })
  @ApiResponse({
    status: 201,
    description: 'Session opened successfully',
    schema: {
      example: {
        message: 'Session opened successfully',
        session: {
          id: 'session-uuid',
          openedByUserId: 'user-uuid',
          status: 'OPEN',
          openingAmount: 1000,
          totalOrders: 0,
          totalSales: 0,
          openedAt: '2024-06-13T10:30:00Z',
          closedAt: null,
          openedByUser: {
            id: 'user-uuid',
            name: 'John Employee',
            email: 'john@cafe.com',
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'User already has an open session',
    schema: {
      example: {
        statusCode: 409,
        message: 'You already have an open session. Please close it before opening a new one.',
        error: 'Conflict',
      },
    },
  })
  async openSession(
    @Request() req: any,
    @Body() openSessionDto: OpenSessionDto,
  ) {
    this.logger.log(`Opening session for user: ${req.user.id}`);
    return this.sessionsService.openSession(req.user.id, openSessionDto);
  }

  /**
   * Get current open session for logged-in user
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get('current')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Current Session',
    description: 'Get the currently open session for the logged-in user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current session details',
    schema: {
      example: {
        id: 'session-uuid',
        openedByUserId: 'user-uuid',
        status: 'OPEN',
        openingAmount: 1000,
        closingAmount: null,
        totalSales: 2500,
        totalOrders: 5,
        openedAt: '2024-06-13T10:30:00Z',
        closedAt: null,
        openedByUser: {
          id: 'user-uuid',
          name: 'John Employee',
          email: 'john@cafe.com',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'No open session found',
    schema: {
      example: {
        statusCode: 404,
        message: 'No active session found. Please open a session first.',
        error: 'Not Found',
      },
    },
  })
  async getCurrentSession(@Request() req: any) {
    this.logger.log(`Fetching current session for user: ${req.user.id}`);
    return this.sessionsService.getCurrentSession(req.user.id);
  }

  /**
   * Get session by ID
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Session',
    description: 'Get a specific session by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
    example: 'session-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Session details',
    schema: {
      example: {
        id: 'session-uuid',
        openedByUserId: 'user-uuid',
        status: 'OPEN',
        openingAmount: 1000,
        closingAmount: null,
        totalSales: 2500,
        totalOrders: 5,
        openedAt: '2024-06-13T10:30:00Z',
        closedAt: null,
        openedByUser: {
          id: 'user-uuid',
          name: 'John Employee',
          email: 'john@cafe.com',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Session not found',
  })
  @ApiForbiddenResponse({
    description: 'User cannot access this session',
    schema: {
      example: {
        statusCode: 403,
        message: 'You can only view your own sessions',
        error: 'Forbidden',
      },
    },
  })
  async getSession(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Fetching session: ${id}`);
    return this.sessionsService.getSession(id, req.user.id);
  }

  /**
   * Close a POS session
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiOperation({
    summary: 'Close Session',
    description: 'Close a POS session and calculate final totals',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
    example: 'session-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Session closed successfully',
    schema: {
      example: {
        message: 'Session closed successfully',
        session: {
          id: 'session-uuid',
          openedByUserId: 'user-uuid',
          status: 'CLOSED',
          openingAmount: 1000,
          closingAmount: 5000,
          totalSales: 4500,
          totalOrders: 15,
          openedAt: '2024-06-13T10:30:00Z',
          closedAt: '2024-06-13T18:30:00Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Session not found',
  })
  @ApiConflictResponse({
    description: 'Session already closed',
    schema: {
      example: {
        statusCode: 409,
        message: 'This session is already closed',
        error: 'Conflict',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'User cannot close this session',
  })
  async closeSession(
    @Param('id') id: string,
    @Request() req: any,
    @Body() closeSessionDto: CloseSessionDto,
  ) {
    this.logger.log(`Closing session: ${id}`);
    return this.sessionsService.closeSession(id, req.user.id, closeSessionDto);
  }

  /**
   * Get session summary (for closing screen)
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get(':id/summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Session Summary',
    description: 'Get session summary (used for session closing screen)',
  })
  @ApiParam({
    name: 'id',
    description: 'Session ID',
    example: 'session-uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Session summary',
    schema: {
      example: {
        sessionId: 'session-uuid',
        openedAt: '2024-06-13T10:30:00Z',
        closedAt: '2024-06-13T18:30:00Z',
        totalOrders: 25,
        totalSales: 12500,
        openingAmount: 1000,
        closingAmount: 13500,
        status: 'CLOSED',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Session not found',
  })
  @ApiForbiddenResponse({
    description: 'User cannot access this session',
  })
  async getSessionSummary(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Fetching session summary: ${id}`);
    return this.sessionsService.getSessionSummary(id, req.user.id);
  }

  /**
   * Get session history (ADMIN only)
   */
  @Roles('ADMIN')
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Session History',
    description: 'Get paginated session history (ADMIN only)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by session status',
    enum: ['OPEN', 'CLOSED'],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
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
    description: 'Session history',
    schema: {
      example: {
        data: [
          {
            id: 'session-uuid-1',
            openedByUserId: 'user-uuid-1',
            status: 'CLOSED',
            openingAmount: 1000,
            closingAmount: 5000,
            totalSales: 4500,
            totalOrders: 15,
            openedAt: '2024-06-13T10:30:00Z',
            closedAt: '2024-06-13T18:30:00Z',
            openedByUser: {
              id: 'user-uuid-1',
              name: 'John Employee',
              email: 'john@cafe.com',
            },
          },
        ],
        total: 50,
        page: 1,
        limit: 10,
        totalPages: 5,
      },
    },
  })
  async getSessionHistory(@Query() filterDto: SessionFilterDto) {
    this.logger.log(`Fetching session history`);
    return this.sessionsService.getSessionHistory(filterDto);
  }

  /**
   * Get dashboard data (before entering POS)
   * Accessible to ADMIN and EMPLOYEE
   */
  @Roles('ADMIN', 'EMPLOYEE')
  @Get('dashboard/info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Dashboard Info',
    description:
      'Get dashboard information before entering POS (last session date, closing amount, current status)',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard information',
    schema: {
      example: {
        lastSessionDate: '2024-06-13T18:30:00Z',
        lastClosingAmount: 13500,
        currentSessionStatus: null,
      },
    },
  })
  async getDashboardData(@Request() req: any) {
    this.logger.log(`Fetching dashboard data for user: ${req.user.id}`);
    return this.sessionsService.getDashboardData(req.user.id);
  }
}
