import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: 'database.sqlite',
      synchronize: true,
      autoLoadModels: true,
      models: [__dirname + '/**/*.model.ts'],
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}