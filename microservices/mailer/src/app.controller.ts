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
  async confirmUpload(@Payload() data: {email: string, target: string[], download: string, fileName: string, expire: Date}) {
    await this.appService.sendConfirmFileSent(data);
  }

  @EventPattern('notify')
  async notify(@Payload() data: {from: string, email: string, expire: Date, download: string, fileName: string}) {
    await this.appService.sendReceivedFile(data);
  }

  @EventPattern('file_downloaded')
  async confirmDownload(@Payload() data: {email: string, author: string, fileName: string}) {
    await this.appService.sendConfirmFileDownloaded(data);
  }

  @EventPattern('send_token')
  async sendToken(@Payload() data: {email: string, token: string}) {
    await this.appService.sendSecurityToken(data);
  }
}
