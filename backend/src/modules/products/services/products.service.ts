import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductFilterDto } from '../dto/product-filter.dto';
import { RecommendRequestDto } from '../dto/recommend-request.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    this.logger.log('Creating product: ' + createProductDto.name);

    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.isActive) {
      throw new BadRequestException('Category is archived');
    }

    const existingProduct = await this.prisma.product.findFirst({
      where: {
        categoryId: createProductDto.categoryId,
        name: createProductDto.name.trim(),
      },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this name already exists in this category');
    }

    const product = await this.prisma.product.create({
      data: {
        categoryId: createProductDto.categoryId,
        name: createProductDto.name.trim(),
        description: createProductDto.description?.trim(),
        imageUrl: createProductDto.imageUrl,
        price: createProductDto.price,
        taxRate: createProductDto.taxRate,
        unitOfMeasure: createProductDto.unitOfMeasure,
        preparationTime: createProductDto.preparationTime,
        isKdsVisible: createProductDto.isKdsVisible ?? true,
        isActive: true,
      },
      include: { category: true },
    });

    this.logger.log('Product created successfully: ' + product.id);

    return {
      message: 'Product created successfully',
      data: this.formatProduct(product),
    };
  }

  async uploadImage(file: Express.Multer.File) {
    this.logger.log('Uploading product image: ' + file.filename);

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const imageUrl = '/uploads/products/' + file.filename;

    this.logger.log('Product image uploaded: ' + imageUrl);

    return {
      imageUrl: imageUrl,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async findAll(filters: ProductFilterDto) {
    this.logger.debug('Fetching products with filters');

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: any = { isActive: true };

    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.search) {
      whereClause.name = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where: whereClause }),
    ]);

    this.logger.log('Retrieved ' + products.length + ' products');

    return {
      data: products.map(p => this.formatProduct(p)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    this.logger.debug('Fetching product by id: ' + id);

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new NotFoundException('Product not found');
    }

    return this.formatProduct(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    this.logger.log('Updating product: ' + id);

    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.categoryId && updateProductDto.categoryId !== product.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('New category not found');
      }

      if (!category.isActive) {
        throw new BadRequestException('New category is archived');
      }
    }

    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const categoryId = updateProductDto.categoryId || product.categoryId;
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          categoryId,
          name: updateProductDto.name.trim(),
          id: { not: id },
        },
      });

      if (existingProduct) {
        throw new ConflictException('Product with this name already exists in this category');
      }
    }

    const dataToUpdate: any = {};
    if (updateProductDto.categoryId) dataToUpdate.categoryId = updateProductDto.categoryId;
    if (updateProductDto.name) dataToUpdate.name = updateProductDto.name.trim();
    if (updateProductDto.description !== undefined)
      dataToUpdate.description = updateProductDto.description?.trim();
    if (updateProductDto.imageUrl !== undefined) dataToUpdate.imageUrl = updateProductDto.imageUrl;
    if (updateProductDto.price !== undefined) dataToUpdate.price = updateProductDto.price;
    if (updateProductDto.taxRate !== undefined) dataToUpdate.taxRate = updateProductDto.taxRate;
    if (updateProductDto.unitOfMeasure !== undefined)
      dataToUpdate.unitOfMeasure = updateProductDto.unitOfMeasure;
    if (updateProductDto.preparationTime !== undefined)
      dataToUpdate.preparationTime = updateProductDto.preparationTime;
    if (updateProductDto.isKdsVisible !== undefined)
      dataToUpdate.isKdsVisible = updateProductDto.isKdsVisible;

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: { category: true },
    });

    this.logger.log('Product updated successfully: ' + id);

    return {
      message: 'Product updated successfully',
      data: this.formatProduct(updatedProduct),
    };
  }

  async delete(id: string) {
    this.logger.log('Soft deleting product: ' + id);

    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log('Product archived successfully: ' + id);

    return {
      message: 'Product archived successfully',
    };
  }

  async getPosData() {
    this.logger.debug('Fetching POS data');

    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    // Filter products that have active categories
    const filteredProducts = products.filter(p => p.category && p.category.isActive);

    this.logger.log('Retrieved ' + filteredProducts.length + ' products for POS');

    return {
      data: filteredProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        unitOfMeasure: p.unitOfMeasure,
        imageUrl: p.imageUrl,
        isKdsVisible: p.isKdsVisible,
        category: {
          id: p.category.id,
          name: p.category.name,
          color: p.category.color,
          imageUrl: p.category.imageUrl,
        },
      })),
    };
  }

  private formatProduct(product: any) {
    return {
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      price: product.price,
      taxRate: product.taxRate,
      unitOfMeasure: product.unitOfMeasure,
      preparationTime: product.preparationTime,
      isKdsVisible: product.isKdsVisible,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: product.category
        ? {
          id: product.category.id,
          name: product.category.name,
          color: product.category.color,
          imageUrl: product.category.imageUrl,
        }
        : undefined,
    };
  }

  async recommend(recommendDto: RecommendRequestDto) {
    const productIdsOrNames = recommendDto.productIds || [];
    if (productIdsOrNames.length === 0) {
      return {
        recommendedProductId: '',
        recommendedProductName: '',
        recommendedProductPrice: 0,
        reason: '',
      };
    }

    // Resolve products from the database (either by ID or name)
    const dbProductsById = await this.prisma.product.findMany({
      where: {
        id: { in: productIdsOrNames },
        isActive: true,
      },
    });

    const dbProductsByName = await this.prisma.product.findMany({
      where: {
        name: { in: productIdsOrNames },
        isActive: true,
      },
    });

    const allResolvedProducts = [...dbProductsById, ...dbProductsByName];
    const productMap = new Map(allResolvedProducts.map(p => [p.id, p]));
    const resolvedProducts = Array.from(productMap.values());
    const resolvedProductIds = resolvedProducts.map(p => p.id);
    const resolvedProductNames = resolvedProducts.map(p => p.name);

    if (resolvedProductIds.length === 0) {
      // If we couldn't resolve any of the input items, look up the top products in the system to suggest something
      const topProducts = await this.prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
        },
        where: {
          order: {
            status: 'COMPLETED',
          },
          product: {
            isActive: true,
          },
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      });

      if (topProducts.length === 0) {
        // Find any active product as absolute fallback
        const fallbackProd = await this.prisma.product.findFirst({
          where: { isActive: true },
        });
        if (!fallbackProd) {
          return {
            recommendedProductId: '',
            recommendedProductName: '',
            recommendedProductPrice: 0,
            reason: '',
          };
        }
        return {
          recommendedProductId: fallbackProd.id,
          recommendedProductName: fallbackProd.name,
          recommendedProductPrice: Number(fallbackProd.price),
          reason: `We highly recommend our fresh ${fallbackProd.name}!`,
        };
      }

      // Fetch the details of the top seller
      const topSeller = await this.prisma.product.findUnique({
        where: { id: topProducts[0].productId },
      });
      if (!topSeller) {
        return {
          recommendedProductId: '',
          recommendedProductName: '',
          recommendedProductPrice: 0,
          reason: '',
        };
      }
      return {
        recommendedProductId: topSeller.id,
        recommendedProductName: topSeller.name,
        recommendedProductPrice: Number(topSeller.price),
        reason: `Try our best selling ${topSeller.name}!`,
      };
    }

    // Find all completed orders that contain at least one of the resolved productIds
    const matchingOrders = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        orderItems: {
          some: {
            productId: { in: resolvedProductIds },
          },
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Compute co-occurrences of other products
    const coOccurrenceCounts: { [productId: string]: { name: string; price: number; count: number } } = {};
    for (const order of matchingOrders) {
      for (const item of order.orderItems) {
        if (!resolvedProductIds.includes(item.productId) && item.product.isActive) {
          if (!coOccurrenceCounts[item.productId]) {
            coOccurrenceCounts[item.productId] = {
              name: item.product.name,
              price: Number(item.product.price),
              count: 0,
            };
          }
          coOccurrenceCounts[item.productId].count += item.quantity;
        }
      }
    }

    let sortedCoOccurrences = Object.keys(coOccurrenceCounts)
      .map(id => ({
        id,
        name: coOccurrenceCounts[id].name,
        price: coOccurrenceCounts[id].price,
        count: coOccurrenceCounts[id].count,
      }))
      .sort((a, b) => b.count - a.count);

    // If no direct co-occurrences were found, query top-selling products not in the cart
    if (sortedCoOccurrences.length === 0) {
      const topProducts = await this.prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
        },
        where: {
          order: {
            status: 'COMPLETED',
          },
          productId: {
            notIn: resolvedProductIds,
          },
          product: {
            isActive: true,
          },
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      });

      if (topProducts.length > 0) {
        const topProductDetails = await this.prisma.product.findMany({
          where: {
            id: { in: topProducts.map(tp => tp.productId) },
            isActive: true,
          },
        });
        for (const p of topProductDetails) {
          const sumObj = topProducts.find(tp => tp.productId === p.id);
          sortedCoOccurrences.push({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            count: sumObj?._sum?.quantity || 0,
          });
        }
      }
    }

    // If still empty, add any active product not in the cart as fallback
    if (sortedCoOccurrences.length === 0) {
      const anyActiveProducts = await this.prisma.product.findMany({
        where: {
          id: { notIn: resolvedProductIds },
          isActive: true,
        },
        take: 5,
      });
      for (const p of anyActiveProducts) {
        sortedCoOccurrences.push({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          count: 0,
        });
      }
    }

    if (sortedCoOccurrences.length === 0) {
      return {
        recommendedProductId: '',
        recommendedProductName: '',
        recommendedProductPrice: 0,
        reason: '',
      };
    }

    // Call Python AI Service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    try {
      const response = await globalThis.fetch(`${aiServiceUrl}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: resolvedProductNames,
          coOccurrences: sortedCoOccurrences.slice(0, 5),
        }),
      });

      if (response.ok) {
        const recommendation = await response.json();
        return recommendation;
      } else {
        const errText = await response.text();
        this.logger.error('AI Service /recommend returned error: ' + errText);
      }
    } catch (err) {
      this.logger.error('Failed to connect to AI Service /recommend: ' + err.message);
    }

    // Fallback if AI Service is unreachable
    const topCandidate = sortedCoOccurrences[0];
    const cartStr = resolvedProductNames.join(', ');
    return {
      recommendedProductId: topCandidate.id,
      recommendedProductName: topCandidate.name,
      recommendedProductPrice: topCandidate.price,
      reason: `People who buy ${cartStr} often buy ${topCandidate.name}.`,
    };
  }
}
