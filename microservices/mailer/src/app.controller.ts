import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('test')
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern('confirm_upload')
  async confirmUpload(@Payload() data: {email: string, target: string[], download: string}) {
    console.log(data);
    await this.appService.sendConfirmFileSent(data);
  }

  @EventPattern('notify')
  async notify(@Payload() data: {from: string, email: string, expire: Date, download: string}) {
    console.log(data);
    await this.appService.sendReceivedFile(data);
  }
}
