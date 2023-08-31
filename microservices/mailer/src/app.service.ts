import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private mailer: MailerService, private config: ConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }


  async sendMail() {
    await this.mailer.sendMail({
      to: 'boulangermatheo621@gmail.com',
      from: this.config.get<string>('SMTP_USER'),
      subject: 'Testing Nest MailerModule ✔',
      template: 'test',
      context: {
        name: 'John Doe',
        url: 'http://localhost:3000/upload/fileName/key/iv'
      }
    });
  }
}
