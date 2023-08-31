import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('test')
  async getHello(@Payload() data: any): Promise<void> {
    console.log(data);
    await this.appService.sendMail();
  }
}
