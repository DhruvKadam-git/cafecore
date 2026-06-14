import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './services/reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DateRangeDto } from './dto/date-range.dto';
import { ChatRequestDto } from './dto/chat-request.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Get sales report' })
  async getSalesReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getSalesReport(dateRange);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top products report' })
  async getTopProductsReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getTopProductsReport(dateRange);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  async getRevenueReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getRevenueReport(dateRange);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get categories sales breakdown report' })
  async getCategoryReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getCategoryReport(dateRange);
  }

  @Get('revenue-trend')
  @ApiOperation({ summary: 'Get revenue trend report' })
  async getRevenueTrend(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getRevenueTrend(dateRange);
  }

  @Get('top-orders')
  @ApiOperation({ summary: 'Get top orders report' })
  async getTopOrdersReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getTopOrdersReport(dateRange);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get orders report' })
  async getOrdersReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getOrdersReport(dateRange);
  }

  @Get('ai-insights')
  @ApiOperation({ summary: 'Get AI sales insights and business recommendations' })
  async getAIInsights(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getAIInsights(dateRange);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Ask Cafe AI about store performance, slow items, best employees, and analytics' })
  async chatCafe(@Body() chatRequestDto: ChatRequestDto) {
    return this.reportsService.chatCafe(chatRequestDto);
  }
}
