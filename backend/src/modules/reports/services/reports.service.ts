import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DateRangeDto } from '../dto/date-range.dto';
import { ChatRequestDto } from '../dto/chat-request.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesReport(dateRange: DateRangeDto) {
    const { startDate, endDate } = this._parseDateRange(dateRange);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { items: true, payment: true },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      const orderTotal = order.items.reduce(
        (itemSum, item) => itemSum + item.unitPrice * item.quantity,
        0,
      );
      return sum + orderTotal;
    }, 0);

    return {
      period: { startDate, endDate },
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  }

  async getTopProductsReport(dateRange: DateRangeDto) {
    const { startDate, endDate } = this._parseDateRange(dateRange);

    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: { product: true },
    });

    const productSales = items.reduce((acc, item) => {
      const existing = acc.find((p) => p.productId === item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.unitPrice * item.quantity;
      } else {
        acc.push({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          revenue: item.unitPrice * item.quantity,
        });
      }
      return acc;
    }, [] as any[]);

    return productSales.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }

  async getRevenueReport(dateRange: DateRangeDto) {
    const { startDate, endDate } = this._parseDateRange(dateRange);

    const payments = await this.prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const byMethod = payments.reduce((acc, payment) => {
      const existing = acc.find((p) => p.method === payment.method);
      if (existing) {
        existing.amount += payment.amount;
        existing.count += 1;
      } else {
        acc.push({
          method: payment.method,
          amount: payment.amount,
          count: 1,
        });
      }
      return acc;
    }, [] as any[]);

    return {
      period: { startDate, endDate },
      byPaymentMethod: byMethod,
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    };
  }

  async getOrdersReport(dateRange: DateRangeDto) {
    const { startDate, endDate } = this._parseDateRange(dateRange);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const byStatus = orders.reduce((acc, order) => {
      const existing = acc.find((o) => o.status === order.status);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({
          status: order.status,
          count: 1,
        });
      }
      return acc;
    }, [] as any[]);

    return {
      period: { startDate, endDate },
      totalOrders: orders.length,
      byStatus,
    };
  }

  private _parseDateRange(dateRange: DateRangeDto) {
    const startDate = dateRange.startDate
      ? new Date(dateRange.startDate)
      : this._getStartOfDay(new Date());
    const endDate = dateRange.endDate
      ? new Date(dateRange.endDate)
      : this._getEndOfDay(new Date());

    return { startDate, endDate };
  }

  private _getStartOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private _getEndOfDay(date: Date): Date {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  async getAIInsights(dateRange?: DateRangeDto) {
    let currentStart: Date;
    let currentEnd: Date;
    let prevStart: Date;
    let prevEnd: Date;
    let periodLabel = 'Last 7 Days (vs Prior 7 Days)';

    if (dateRange && (dateRange.startDate || dateRange.endDate)) {
      currentEnd = dateRange.endDate ? new Date(dateRange.endDate) : new Date();
      currentStart = dateRange.startDate ? new Date(dateRange.startDate) : new Date(currentEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const duration = currentEnd.getTime() - currentStart.getTime();
      prevStart = new Date(currentStart.getTime() - duration);
      prevEnd = currentStart;

      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      periodLabel = `${formatDate(currentStart)} to ${formatDate(currentEnd)} (vs ${formatDate(prevStart)} to ${formatDate(prevEnd)})`;
    } else {
      const now = new Date();
      currentEnd = now;
      currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      prevEnd = currentStart;
    }

    console.log('[Reports Service - AI Insights] Date Calculations:', {
      currentStart: currentStart.toISOString(),
      currentEnd: currentEnd.toISOString(),
      prevStart: prevStart.toISOString(),
      prevEnd: prevEnd.toISOString(),
      periodLabel
    });

    // Current period completed orders
    const currentOrders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: currentStart, lte: currentEnd },
        status: 'COMPLETED',
      },
      include: {
        items: { include: { product: { include: { category: true } } } },
        payment: true,
      },
    });

    // Previous period completed orders
    const prevOrders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: prevStart, lt: prevEnd },
        status: 'COMPLETED',
      },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
    });

    console.log('[Reports Service - AI Insights] Orders Fetched:', {
      currentOrdersCount: currentOrders.length,
      prevOrdersCount: prevOrders.length
    });

    const currentRevenue = currentOrders.reduce(
      (sum, o) => sum + (o.payment?.amount || 0),
      0,
    );
    const prevRevenue = prevOrders.reduce(
      (sum, o) => sum + (o.payment?.amount || 0),
      0,
    );

    let revenueGrowth = 0;
    if (prevRevenue > 0) {
      revenueGrowth = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
    }

    const currentProductSales: {
      [key: string]: { name: string; qty: number; revenue: number };
    } = {};
    const prevProductSales: { [key: string]: number } = {};

    for (const o of currentOrders) {
      for (const item of o.items) {
        if (!currentProductSales[item.productId]) {
          currentProductSales[item.productId] = {
            name: item.product.name,
            qty: 0,
            revenue: 0,
          };
        }
        currentProductSales[item.productId].qty += item.quantity;
        currentProductSales[item.productId].revenue +=
          item.unitPrice * item.quantity;
      }
    }

    for (const o of prevOrders) {
      for (const item of o.items) {
        prevProductSales[item.productId] =
          (prevProductSales[item.productId] || 0) + item.quantity;
      }
    }

    const topProducts = Object.values(currentProductSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const categorySales: { [key: string]: number } = {};
    for (const o of currentOrders) {
      for (const item of o.items) {
        const catName = item.product.category?.name || 'Uncategorized';
        categorySales[catName] =
          (categorySales[catName] || 0) + item.unitPrice * item.quantity;
      }
    }

    const totalCatRevenue = Object.values(categorySales).reduce(
      (sum, val) => sum + val,
      0,
    );
    const categoryContributions = Object.entries(categorySales)
      .map(([name, rev]) => ({
        name,
        revenue: rev,
        percentage:
          totalCatRevenue > 0
            ? parseFloat(((rev / totalCatRevenue) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const tableSales: { [key: string]: number } = {};
    const allTables = await this.prisma.table.findMany();
    const tableNameMap = new Map(allTables.map((t) => [t.id, t.name]));

    for (const o of currentOrders) {
      if (o.tableId) {
        const tableName = tableNameMap.get(o.tableId) || `Table ${o.tableId}`;
        const orderTotal = o.items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0,
        );
        tableSales[tableName] = (tableSales[tableName] || 0) + orderTotal;
      }
    }

    const topTables = Object.entries(tableSales)
      .map(([name, rev]) => ({ name, revenue: rev }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    const hourOrders: { [key: number]: number } = {};
    for (const o of currentOrders) {
      const hour = o.createdAt.getHours();
      hourOrders[hour] = (hourOrders[hour] || 0) + 1;
    }

    const peakHours = Object.entries(hourOrders)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const productDrops: Array<{
      name: string;
      prevQty: number;
      currQty: number;
      dropPercentage: number;
    }> = [];
    for (const [productId, currData] of Object.entries(currentProductSales)) {
      const prevQty = prevProductSales[productId] || 0;
      if (prevQty > 5 && currData.qty < prevQty) {
        const diff = prevQty - currData.qty;
        const dropPct = parseFloat(((diff / prevQty) * 100).toFixed(1));
        if (dropPct >= 10) {
          productDrops.push({
            name: currData.name,
            prevQty,
            currQty: currData.qty,
            dropPercentage: dropPct,
          });
        }
      }
    }
    productDrops.sort((a, b) => b.dropPercentage - a.dropPercentage);

    const dataSummary = {
      currentRevenue,
      prevRevenue,
      revenueGrowth,
      topProducts,
      categoryContributions,
      topTables,
      peakHours,
      productDrops,
      period: periodLabel,
    };

    console.log('[Reports Service - AI Insights] Payload being sent to AI Service:', JSON.stringify(dataSummary, null, 2));

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    try {
      const response = await globalThis.fetch(`${aiServiceUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataSummary),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errText = await response.text();
        console.error('AI Service returned error:', errText);
      }
    } catch (err) {
      console.error('Failed to connect to AI Service:', err);
    }

    const localInsights = [
      `Revenue is $${currentRevenue.toFixed(2)} this period (${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% compared to the prior period).`,
      topProducts[0]
        ? `${topProducts[0].name} contributes $${topProducts[0].revenue.toFixed(2)} to total sales.`
        : 'No top product recorded.',
      categoryContributions[0]
        ? `${categoryContributions[0].name} contributes ${categoryContributions[0].percentage}% of total sales.`
        : '',
      topTables.length > 0
        ? `Tables ${topTables.map((t) => t.name.replace('Table ', '')).join(' and ')} generate the highest revenue.`
        : '',
      peakHours[0]
        ? `Sales peak between ${peakHours[0].hour % 12 || 12} ${peakHours[0].hour >= 12 ? 'PM' : 'AM'} and ${(peakHours[0].hour + 1) % 12 || 12} ${peakHours[0].hour + 1 >= 12 ? 'PM' : 'AM'}.`
        : '',
      productDrops[0]
        ? `${productDrops[0].name} sales dropped ${productDrops[0].dropPercentage}% compared to the prior period.`
        : '',
      `Consider running a promotion on ${categoryContributions[categoryContributions.length - 1]?.name || 'beverages'} to boost sales.`,
    ]
      .filter((b) => b !== '')
      .map((b) => `- ${b}`);

    return {
      source: 'local-analytics-fallback',
      insights: localInsights,
      rawData: dataSummary,
    };
  }

  async chatCafe(chatRequest: ChatRequestDto) {
    // 1. Get all products and categories
    const products = await this.prisma.product.findMany({
      include: { category: true },
    });

    // 2. Get 30-day order statistics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
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
        unitPrice: true,
      },
    });

    const salesQtyMap = new Map<string, number>();
    const salesRevMap = new Map<string, number>();
    for (const item of orderItems) {
      salesQtyMap.set(item.productId, (salesQtyMap.get(item.productId) || 0) + item.quantity);
      salesRevMap.set(item.productId, (salesRevMap.get(item.productId) || 0) + item.quantity * item.unitPrice);
    }

    // Sort products by sales volume
    const sortedProducts = products.map((p) => ({
      name: p.name,
      category: p.category?.name || 'Uncategorized',
      price: Number(p.price),
      qtySold: salesQtyMap.get(p.id) || 0,
      revenue: salesRevMap.get(p.id) || 0,
    })).sort((a, b) => b.qtySold - a.qtySold);

    const bestProducts = sortedProducts.slice(0, 5);
    const slowProducts = sortedProducts.filter(p => p.qtySold <= 5).slice(0, 5);

    // 3. Table Performance
    const orders = await this.prisma.order.findMany({
      where: { status: 'COMPLETED' },
      include: { items: true, table: true },
    });

    const tableSales: { [key: string]: number } = {};
    for (const o of orders) {
      if (o.table) {
        const total = o.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
        tableSales[o.table.name] = (tableSales[o.table.name] || 0) + total;
      }
    }
    const sortedTables = Object.entries(tableSales)
      .map(([name, rev]) => ({ name, revenue: rev }))
      .sort((a, b) => b.revenue - a.revenue);

    // 4. Employees and Session counts
    const employees = await this.prisma.user.findMany({
      select: { id: true, name: true, role: true, email: true },
    });

    const sessionCounts = await this.prisma.session.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      where: {
        status: 'closed',
      },
    });

    const sessionMap = new Map(sessionCounts.map((s) => [s.userId || '', s._count.id]));

    // 5. Total Store Metrics
    const totalOrdersCount = orders.length;
    const totalStoreRevenue = orders.reduce((sum, o) => {
      return sum + o.items.reduce((itemSum, i) => itemSum + i.unitPrice * i.quantity, 0);
    }, 0);

    // 6. Build the Context Markdown
    const employeeRows = employees.map(emp => {
      const shifts = sessionMap.get(emp.id) || 0;
      return `- ${emp.name} (${emp.email}): Role: ${emp.role}, Completed Shifts: ${shifts}`;
    }).join('\n');

    const topProductRows = bestProducts.map(p => {
      return `- ${p.name} (${p.category}): ${p.qtySold} sold, $${p.revenue.toFixed(2)} revenue`;
    }).join('\n');

    const slowProductRows = slowProducts.map(p => {
      return `- ${p.name} (${p.category}): ${p.qtySold} sold (Slow Moving)`;
    }).join('\n');

    const tableRows = sortedTables.map(t => {
      return `- ${t.name}: $${t.revenue.toFixed(2)} total billing`;
    }).join('\n');

    const context = `
=== BUSINESS OVERVIEW ===
- Total Completed Orders: ${totalOrdersCount}
- Total Store Revenue: $${totalStoreRevenue.toFixed(2)}
- Average Order Ticket: $${totalOrdersCount > 0 ? (totalStoreRevenue / totalOrdersCount).toFixed(2) : '0.00'}

=== TOP PRODUCTS (LAST 30 DAYS) ===
${topProductRows || '- No products sold yet.'}

=== SLOW-MOVING PRODUCTS (LAST 30 DAYS) ===
${slowProductRows || '- No slow products identified.'}

=== TABLE BILLING ===
${tableRows || '- No table orders completed yet.'}

=== STAFF & SHIFTS OVERVIEW ===
${employeeRows || '- No employees registered.'}
`;

    console.log('[Reports Service - Chatbot] Generated context size:', context.length, 'chars');

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    try {
      const response = await globalThis.fetch(`${aiServiceUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatRequest.message,
          context: context,
          history: chatRequest.history || [],
        }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errText = await response.text();
        console.error('AI Service /chat returned error:', errText);
      }
    } catch (err) {
      console.error('Failed to connect to AI Service /chat:', err);
    }

    // Fallback response if LLM is down
    return {
      source: 'local-fallback',
      reply: '🤖 **Cafe AI**:\nI am running in local offline mode. Please verify the AI microservice status.'
    };
  }
}
