import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Upload directory
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'categories');

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const multerConfig: MulterOptions = {
    storage: diskStorage({
        destination: (req, file, callback) => {
            callback(null, UPLOAD_DIR);
        },
        filename: (req, file, callback) => {
            // Generate unique filename: originalname-uuid.ext
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const fileExt = extname(file.originalname);
            const fileName = file.originalname.replace(fileExt, '');
            callback(null, fileName + '-' + uniqueSuffix + fileExt);
        },
    }),
    fileFilter: (req, file, callback) => {
        // Check MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return callback(
                new BadRequestException(
                    'Invalid file type. Only jpg, jpeg, png, and webp are allowed',
                ),
                false,
            );
        }

        // Check file extension
        const fileExt = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
            return callback(
                new BadRequestException(
                    'Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed',
                ),
                false,
            );
        }

        callback(null, true);
    },
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
};

// Custom filter for file size
export const fileSizeFilter = (req, file, callback) => {
    if (file.size > MAX_FILE_SIZE) {
        callback(
            new BadRequestException(
                'File size exceeds 5MB limit. Uploaded file: ' +
                (file.size / 1024 / 1024).toFixed(2) +
                'MB',
            ),
            false,
        );
    } else {
        callback(null, true);
    }
};

export const UPLOAD_PATH = 'uploads/categories';
