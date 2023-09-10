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
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecurityModule } from 'src/security/security.module';

@Module({
  imports: [
    SequelizeModule.forFeature([File, FileTo]),
    BullModule.registerQueue({name: "zipper"}, {name: "encryption"}),
    ClientsModule.registerAsync([{
      name: 'MAILER_SERVICE',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: Transport.RMQ,
        options: {
          urls: [config.get<string>('RABBITMQ_URL')],
          queue: 'mailer_queue',
          queueOptions: {
            durable: false
          },
        }
      }),
    }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('DOWNLOAD_TOKEN_SECRET'),
        signOptions: {
          expiresIn: '7d'
        }
      })
    }),
    ConfigModule,
    SecurityModule
  ],
  controllers: [UploadController],
  providers: [UploadService, ZipperProcessor, EncryptionProcessor],
})
export class UploadModule {}
