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
import { ProductsService } from './services/products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { multerConfig } from '../categories/config/multer.config';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiOperation({
    summary: 'Create Product',
    description: 'Create a new product (Admin only)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or archived category',
  })
  @ApiConflictResponse({
    description: 'Product name already exists in category',
  })
  @ApiForbiddenResponse({
    description: 'Only admin can create products',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log('Create product request: ' + createProductDto.name);

    let imageUrl = createProductDto.imageUrl;
    if (file) {
      imageUrl = '/uploads/products/' + file.filename;
      this.logger.log('Product image uploaded: ' + imageUrl);
    }

    return this.productsService.create({
      ...createProductDto,
      imageUrl,
    });
  }

  @Post('upload-image')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiOperation({
    summary: 'Upload Product Image',
    description: 'Upload an image for a product (Admin only)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid file type or size exceeds 5MB',
  })
  @ApiForbiddenResponse({
    description: 'Only admin can upload images',
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    this.logger.log('Upload image request: ' + file.originalname);
    return this.productsService.uploadImage(file);
  }

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List Products',
    description: 'Get all active products with filters and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  async findAll(@Query() filters: ProductFilterDto) {
    this.logger.log('List products request');
    return this.productsService.findAll(filters);
  }

  @Get('pos-data')
  @Roles('ADMIN', 'EMPLOYEE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get POS Data',
    description: 'Optimized endpoint for POS frontend (active products with category info)',
  })
  @ApiResponse({
    status: 200,
    description: 'POS data retrieved successfully',
  })
  async getPosData() {
    this.logger.log('Get POS data request');
    return this.productsService.getPosData();
  }

  @Get(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Product By ID',
    description: 'Retrieve a specific product with category information',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  async findById(@Param('id') id: string) {
    this.logger.log('Get product by id: ' + id);
    return this.productsService.findById(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiOperation({
    summary: 'Update Product',
    description: 'Update a product with optional image upload (Admin only)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiConflictResponse({
    description: 'Product name already exists in category',
  })
  @ApiForbiddenResponse({
    description: 'Only admin can update products',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log('Update product: ' + id);

    let imageUrl = updateProductDto.imageUrl;
    if (file) {
      imageUrl = '/uploads/products/' + file.filename;
    }

    return this.productsService.update(id, {
      ...updateProductDto,
      imageUrl,
    });
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Product',
    description: 'Archive a product (soft delete - Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Product archived successfully',
  })
  @ApiNotFoundResponse({
    description: 'Product not found or already archived',
  })
  @ApiForbiddenResponse({
    description: 'Only admin can delete products',
  })
  async delete(@Param('id') id: string) {
    this.logger.log('Delete product: ' + id);
    return this.productsService.delete(id);
  }
}
