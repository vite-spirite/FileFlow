import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Security } from './dto/security.dto';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forFeature([Security]),
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
  ],
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService]
})
export class SecurityModule {}
