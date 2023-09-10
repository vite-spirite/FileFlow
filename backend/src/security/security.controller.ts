import { Body, Controller, Post } from '@nestjs/common';
import { SecurityService } from './security.service';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('/')
  async createToken(@Body() options: {email: string}) {
    return this.securityService.createToken(options.email);
  }
}
