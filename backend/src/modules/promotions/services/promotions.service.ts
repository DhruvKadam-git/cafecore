import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
import { ResourceNotFoundException } from '../../../common/exceptions/custom.exception';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.promotion.findMany();
  }

  async findById(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new ResourceNotFoundException('Promotion');
    }

    return promotion;
  }

  async create(createPromotionDto: CreatePromotionDto) {
    return this.prisma.promotion.create({
      data: {
        name: createPromotionDto.name,
        description: createPromotionDto.description,
        type: String(createPromotionDto.type) as any,
        value: createPromotionDto.value,
        startDate: createPromotionDto.startDate,
        endDate: createPromotionDto.endDate,
        isActive: createPromotionDto.isActive ?? true,
      },
    });
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });

    if (!promotion) {
      throw new ResourceNotFoundException('Promotion');
    }

    const dataToUpdate: any = {};
    if (updatePromotionDto.name) dataToUpdate.name = updatePromotionDto.name;
    if (updatePromotionDto.description)
      dataToUpdate.description = updatePromotionDto.description;
    if (updatePromotionDto.type) dataToUpdate.type = updatePromotionDto.type;
    if (updatePromotionDto.value !== undefined)
      dataToUpdate.value = updatePromotionDto.value;
    if (updatePromotionDto.startDate)
      dataToUpdate.startDate = updatePromotionDto.startDate;
    if (updatePromotionDto.endDate)
      dataToUpdate.endDate = updatePromotionDto.endDate;
    if (updatePromotionDto.isActive !== undefined)
      dataToUpdate.isActive = updatePromotionDto.isActive;

    return this.prisma.promotion.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async delete(id: string) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });

    if (!promotion) {
      throw new ResourceNotFoundException('Promotion');
    }

    return this.prisma.promotion.delete({
      where: { id },
    });
  }

  async generateAIPromotion() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Fetch all products and their category names
    const products = await this.prisma.product.findMany({
      include: { category: true },
    });

    // 2. Fetch all order items from completed orders in the last 30 days
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: 'COMPLETED',
        },
      },
      select: {
        productId: true,
        quantity: true,
      },
    });

    // 3. Aggregate quantities sold per product
    const salesMap = new Map<string, number>();
    for (const item of orderItems) {
      salesMap.set(item.productId, (salesMap.get(item.productId) || 0) + item.quantity);
    }

    // 4. Map products to the format expected by the AI service
    const aiProductsPayload = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      salesQty: salesMap.get(p.id) || 0,
      category: p.category?.name || 'Uncategorized',
    }));

    // 5. Send payload to AI Service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    try {
      console.log('[Promotions Service] Sending inventory and sales data to AI Service...');
      const response = await globalThis.fetch(`${aiServiceUrl}/generate-promotion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: aiProductsPayload }),
      });

      if (response.ok) {
        const recommendation = await response.json();
        console.log('[Promotions Service] Received AI recommendation:', recommendation);
        return recommendation;
      } else {
        const errText = await response.text();
        console.error('AI Service /generate-promotion returned error:', errText);
      }
    } catch (err) {
      console.error('Failed to connect to AI Service /generate-promotion:', err);
    }

    // Fallback if AI Service is unreachable
    console.log('[Promotions Service] Falling back to local promotion logic');
    const sortedProducts = [...aiProductsPayload].sort((a, b) => a.salesQty - b.salesQty);
    const slowProd = sortedProducts[0];

    const analysis = slowProd 
      ? `Coffee sales are strong. ${slowProd.name} sales are weak (only ${slowProd.salesQty} sold).`
      : 'No product data available for analysis.';
    const name = slowProd ? `${slowProd.name} Booster` : 'Smart Discount';
    const description = slowProd ? `Buy 2 ${slowProd.name}s Get 20% Off` : 'Get 10% off selected items';

    return {
      source: 'local-fallback',
      analysis,
      name,
      description,
      type: 'percentage',
      value: 20.0,
      durationDays: 7,
    };
  }
}
