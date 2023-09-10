import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UploadModule } from './upload/upload.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: 'database.sqlite',
      synchronize: true,
      autoLoadModels: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          password: config.get<string>('REDIS_PASSWORD'),
          username: config.get<string>('REDIS_USERNAME'),
        },
      })
    }),
    UploadModule,
    SecurityModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
