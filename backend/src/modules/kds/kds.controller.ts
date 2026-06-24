import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { KdsService } from './services/kds.service';
import { UpdateKdsStatusDto } from './dto/update-kds-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('KDS')
@ApiBearerAuth()
@Controller('kds')
@UseGuards(JwtAuthGuard)
export class KdsController {
  constructor(private kdsService: KdsService) {}

  @Get('queue')
  @ApiOperation({ summary: 'Get order queue for kitchen' })
  async getQueue() {
    return this.kdsService.getOrderQueue();
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get order details' })
  async getOrderDetails(@Param('orderId') orderId: string) {
    return this.kdsService.getOrderDetails(orderId);
  }

  @Put('order/:orderId/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() updateStatusDto: UpdateKdsStatusDto,
  ) {
    return this.kdsService.updateOrderStatus(orderId, updateStatusDto);
  }

  @Post('order/:orderId/mark-ready')
  @ApiOperation({ summary: 'Mark order as ready' })
  async markOrderReady(@Param('orderId') orderId: string) {
    return this.kdsService.markOrderReady(orderId);
  }
}
