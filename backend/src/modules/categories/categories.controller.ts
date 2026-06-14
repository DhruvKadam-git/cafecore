import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { CategoriesService } from './services/categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UploadImageDto, ImageUploadResponseDto } from './dto/upload-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { multerConfig } from './config/multer.config';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiOperation({
    summary: 'Create Category with Optional Image',
    description: 'Create a new category with optional image upload in single request (Admin only)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    schema: {
      example: {
        message: 'Category created successfully',
        data: {
          id: 'uuid-123',
          name: 'Coffee',
          color: '#8B5E3C',
          imageUrl: '/uploads/categories/coffee-1702123456789.png',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  @ApiConflictResponse({
    description: 'Category name already exists',
  })
  @ApiForbiddenResponse({
    description: 'Only admin can create categories',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log('Create category request: ' + createCategoryDto.name);

    // If file is uploaded, generate its URL
    let imageUrl = createCategoryDto.imageUrl;
    if (file) {
      imageUrl = '/uploads/categories/' + file.filename;
      this.logger.log('Image uploaded: ' + imageUrl);
    }

    return this.categoriesService.create({
      ...createCategoryDto,
      imageUrl,
    });
  }

  @Post('upload-image')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiOperation({
    summary: 'Upload Category Image',
    description: 'Upload an image for a category (Admin only)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
    type: ImageUploadResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid file type or size exceeds 5MB',
  })
  @ApiForbiddenResponse({
    description: 'Only admin can upload images',
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    this.logger.log('Upload image request: ' + file.originalname);
    return this.categoriesService.uploadImage(file);
  }

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List Categories',
    description: 'Get all active categories with pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    this.logger.log('List categories request - page: ' + page + ', limit: ' + limit);
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    return this.categoriesService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Category By ID',
    description: 'Retrieve a specific category by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  async findById(@Param('id') id: string) {
    this.logger.log('Get category by id request: ' + id);
    return this.categoriesService.findById(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update Category',
    description: 'Update a category (Admin only). Supports partial updates.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @ApiConflictResponse({
    description: 'Category name already exists',
  })
  @ApiForbiddenResponse({
    description: 'Only admin can update categories',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    this.logger.log('Update category request: ' + id);
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Category',
    description: 'Archive a category (soft delete - Admin only). Sets isActive to false.',
  })
  @ApiResponse({
    status: 200,
    description: 'Category archived successfully',
  })
  @ApiNotFoundResponse({
    description: 'Category not found or already archived',
  })
  @ApiForbiddenResponse({
    description: 'Only admin can delete categories',
  })
  async delete(@Param('id') id: string) {
    this.logger.log('Delete category request: ' + id);
    return this.categoriesService.delete(id);
  }
}

