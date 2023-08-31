import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';

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

  async sendConfirmFileSent(data: {email: string, target: string[], download: string}): Promise<void> {
    await this.mailer.sendMail({
      to: data.email,
      from: this.config.get<string>('SMTP_USER'),
      subject: 'Confirm file sent ✔',
      template: 'confirm-upload',
      context: {
        target: data.target,
        name: data.email.split('@')[0],
        download: data.download
      }
    })
  }

  async sendReceivedFile(data: {from: string, email: string, expire: Date, download: string}): Promise<void> {
    await this.mailer.sendMail({
      to: data.email,
      from: this.config.get<string>('SMTP_USER'),
      subject: 'File received ✔',
      template: 'notify',
      context: {
        name: data.email.split('@')[0],
        from: data.from,
        expire: moment(data.expire).format('DD/MM/YYYY HH:mm:ss'),
        download: data.download
      }
    });
  }
}
