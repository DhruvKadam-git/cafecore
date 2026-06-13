import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Image file (jpg, jpeg, png, webp). Max 5MB',
        example: 'coffee.png',
    })
    image: Express.Multer.File;
}

export class ImageUploadResponseDto {
    @ApiProperty({
        description: 'URL of the uploaded image',
        example: '/uploads/categories/coffee-550e8400.png',
    })
    imageUrl: string;

    @ApiProperty({
        description: 'Original filename',
        example: 'coffee.png',
    })
    filename: string;

    @ApiProperty({
        description: 'File size in bytes',
        example: 102400,
    })
    size: number;

    @ApiProperty({
        description: 'MIME type',
        example: 'image/png',
    })
    mimetype: string;
}
