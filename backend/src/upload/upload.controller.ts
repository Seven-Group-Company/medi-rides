import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) { }

  @Post('driver-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDriverAvatar(@UploadedFile() file: import('multer').File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 5MB.');
    }

    try {
      const result = await this.cloudinaryService.uploadImage(file);
      return { url: result.url };
    } catch (error) {
      throw new BadRequestException('Failed to upload image');
    }
  }
}