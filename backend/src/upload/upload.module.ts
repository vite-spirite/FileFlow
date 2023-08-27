import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';
import { ZipperProcessor } from './processors/zipper.processor';

@Module({
  imports: [
    BullModule.registerQueue({name: "zipper"}),
  ],
  controllers: [UploadController],
  providers: [UploadService, ZipperProcessor],
})
export class UploadModule {}
