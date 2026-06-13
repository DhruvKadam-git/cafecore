import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PromotionsService } from './services/promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Promotions')
@ApiBearerAuth()
@Controller('promotions')
@UseGuards(JwtAuthGuard)
export class PromotionsController {
  constructor(private promotionsService: PromotionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all promotions' })
  async findAll() {
    return this.promotionsService.findAll();
  }

  @Get('generate-ai')
  @ApiOperation({ summary: 'Generate AI promotion recommendation based on slow moving products and inventory' })
  async generateAIPromotion() {
    return this.promotionsService.generateAIPromotion();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promotion by ID' })
  async findById(@Param('id') id: string) {
    return this.promotionsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new promotion' })
  async create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update promotion' })
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete promotion' })
  async delete(@Param('id') id: string) {
    return this.promotionsService.delete(id);
  }
}
