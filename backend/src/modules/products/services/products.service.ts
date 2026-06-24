import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductFilterDto } from '../dto/product-filter.dto';

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
}
