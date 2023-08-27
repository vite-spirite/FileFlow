import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';
import { ZipperProcessor } from './processors/zipper.processor';
import { EncryptionProcessor } from './processors/encryption.processor';
import { File } from './models/file.model';
import { FileTo } from './models/fileTo.model';

@Module({
  imports: [
    SequelizeModule.forFeature([File, FileTo]),
    BullModule.registerQueue({name: "zipper"}, {name: "encryption"}),
  ],
  controllers: [UploadController],
  providers: [UploadService, ZipperProcessor, EncryptionProcessor],
})
export class UploadModule {}
