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

  async sendConfirmFileSent(data: {email: string, target: string[], download: string, fileName: string, expire: Date}): Promise<void> {
    await this.mailer.sendMail({
      to: data.email,
      from: this.config.get<string>('SMTP_USER'),
      subject: 'Confirm file sent ✔',
      template: 'confirm-upload',
      context: {
        target: data.target,
        name: data.email.split('@')[0],
        download: data.download,
        fileName: data.fileName.split('.')[0],
        expire: moment(data.expire).format('DD/MM/YYYY HH:mm:ss')
      }
    })
  }

  async sendReceivedFile(data: {from: string, email: string, expire: Date, download: string, fileName: string}): Promise<void> {
    await this.mailer.sendMail({
      to: data.email,
      from: this.config.get<string>('SMTP_USER'),
      subject: 'File received ✔',
      template: 'notify',
      context: {
        name: data.email.split('@')[0],
        from: data.from,
        expire: moment(data.expire).format('DD/MM/YYYY HH:mm:ss'),
        download: data.download,
        fileName: data.fileName.split('.')[0],
      }
    });
  }

  async sendConfirmFileDownloaded(data: {email: string, author: string, fileName: string}): Promise<void> {
    await this.mailer.sendMail({
      to: data.email,
      from: this.config.get<string>('SMTP_USER'),
      subject: 'File downloaded ✔',
      template: 'confirm-download',
      context: {
        name: data.author.split('@')[0],
        fileName: data.fileName.split('.')[0],
        email: data.email,
        date: moment().format('DD/MM/YYYY HH:mm:ss')
      }
    });
  }

  async sendSecurityToken(data: {email: string, token: string}): Promise<void> {
    await this.mailer.sendMail({
      to: data.email,
      from: this.config.get<string>('SMTP_USER'),
      subject: 'Security token ✔',
      template: 'security-token',
      context: {
        name: data.email.split('@')[0],
        token: data.token
      }
    });
  }
}
