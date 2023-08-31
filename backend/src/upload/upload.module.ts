import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';
import { ZipperProcessor } from './processors/zipper.processor';
import { EncryptionProcessor } from './processors/encryption.processor';
import { File } from './models/file.model';
import { FileTo } from './models/fileTo.model';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    SequelizeModule.forFeature([File, FileTo]),
    BullModule.registerQueue({name: "zipper"}, {name: "encryption"}),
    ClientsModule.register([{
      name: 'MAILER_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://admin:admin@localhost:5672'],
        queue: 'mailer_queue',
        queueOptions: {
          durable: false
        },
        
      },
    }]),
  ],
  controllers: [UploadController],
  providers: [UploadService, ZipperProcessor, EncryptionProcessor],
})
export class UploadModule {}
