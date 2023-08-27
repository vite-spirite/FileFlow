import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UploadModule } from './upload/upload.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: 'database.sqlite',
      synchronize: true,
      autoLoadModels: true,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
        password: 'redis'
      },
    }),
    UploadModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
