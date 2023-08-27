import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { nanoid } from 'nanoid';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', undefined, {
      storage: diskStorage({
        destination: './uploads/tmp/',
        filename: (req, file, cb) => {
          const random = nanoid(32);
          const ext = file.originalname.split('.').pop();
          cb(null, `${random}.${ext}`);
        },
      }),
    })
  )
  async uploadFile(@UploadedFiles() files) {
    await this.uploadService.create(files);
    console.log(files);
  }
}
