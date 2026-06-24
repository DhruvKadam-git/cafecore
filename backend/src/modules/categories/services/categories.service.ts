import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private prisma: PrismaService) { }

  async create(createCategoryDto: CreateCategoryDto) {
    this.logger.log('Creating new category: ' + createCategoryDto.name);

    const existingCategory = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name.trim() },
    });

    if (existingCategory) {
      this.logger.warn('Category already exists: ' + createCategoryDto.name);
      throw new ConflictException('Category with this name already exists');
    }

    const category = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name.trim(),
        color: createCategoryDto.color || null,
        imageUrl: createCategoryDto.imageUrl || null,
        isActive: true,
      },
    });

    this.logger.log('Category created successfully: ' + category.id);

    return {
      message: 'Category created successfully',
      data: {
        id: category.id,
        name: category.name,
      },
    };
  }

  async uploadImage(file: Express.Multer.File) {
    this.logger.log('Uploading image: ' + file.filename);

    if (!file) {
      throw new Error('No file provided');
    }

    const imageUrl = '/uploads/categories/' + file.filename;

    this.logger.log('Image uploaded successfully: ' + imageUrl);

    return {
      imageUrl: imageUrl,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async findAll(page: number = 1, limit: number = 10) {
    this.logger.debug('Fetching all active categories with pagination');

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          color: true,
          imageUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.category.count({
        where: { isActive: true },
      }),
    ]);

    this.logger.log('Retrieved ' + categories.length + ' categories');

    return {
      data: categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    this.logger.debug('Fetching category by id: ' + id);

    const category = await this.prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        color: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!category) {
      this.logger.warn('Category not found: ' + id);
      throw new NotFoundException('Category not found');
    }

    if (!category.isActive) {
      this.logger.warn('Attempted to access archived category: ' + id);
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    this.logger.log('Updating category: ' + id);

    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      this.logger.warn('Category not found for update: ' + id);
      throw new NotFoundException('Category not found');
    }

    if (!category.isActive) {
      this.logger.warn('Attempted to update archived category: ' + id);
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name.trim(),
          id: { not: id },
        },
      });

      if (existingCategory) {
        this.logger.warn('Category name already exists: ' + updateCategoryDto.name);
        throw new ConflictException('Category with this name already exists');
      }
    }

    const dataToUpdate: any = {};
    if (updateCategoryDto.name) dataToUpdate.name = updateCategoryDto.name.trim();
    if (updateCategoryDto.color !== undefined) dataToUpdate.color = updateCategoryDto.color;
    if (updateCategoryDto.imageUrl !== undefined) dataToUpdate.imageUrl = updateCategoryDto.imageUrl;

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        color: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log('Category updated successfully: ' + id);

    return {
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }

  async delete(id: string) {
    this.logger.log('Soft deleting category: ' + id);

    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      this.logger.warn('Category not found for deletion: ' + id);
      throw new NotFoundException('Category not found');
    }

    if (!category.isActive) {
      this.logger.warn('Category already archived: ' + id);
      throw new NotFoundException('Category not found');
    }

    await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log('Category archived successfully: ' + id);

    return {
      message: 'Category archived successfully',
    };
  }
}

