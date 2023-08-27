import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';
import { ZipperProcessor } from './processors/zipper.processor';
import { EncryptionProcessor } from './processors/encryption.processor';

@Module({
  imports: [
    BullModule.registerQueue({name: "zipper"}, {name: "encryption"}),
  ],
  controllers: [UploadController],
  providers: [UploadService, ZipperProcessor, EncryptionProcessor],
})
export class UploadModule {}
