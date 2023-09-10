import { Body, Controller, Get, Param, Post, Res, StreamableFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { nanoid } from 'nanoid';
import { CreateFileDto } from './dto/create-file.dto';
import {Response} from 'express';
import { createDecipheriv } from 'crypto';
import { createReadStream } from 'fs';

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
  async uploadFile(@UploadedFiles() files, @Body() options: CreateFileDto) {
    return await this.uploadService.create(files, options);
  }

  @Get(':file/:token')
  async downloadFile(@Param('file') file: string, @Param('token') token: string, @Res({passthrough: true}) res: Response) {
    const _stream = await this.uploadService.downloadFile(file, token);
    return new StreamableFile(_stream);
  }
}
