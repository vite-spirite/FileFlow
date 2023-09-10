import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Security } from './dto/security.dto';
import { Op } from 'sequelize';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class SecurityService {
    constructor(
        @InjectModel(Security) private securityModel: typeof Security,
        @Inject('MAILER_SERVICE') private client: ClientProxy,
    ) {}

    async checkExistEmail(email: string) {
        const security = await this.securityModel.findOne({where: {email, expiresAt: {[Op.gt]: new Date()}}});
        return !!security;
    }

    async createToken(email: string) {

        if(await this.checkExistEmail(email)) {
            return false;
        }

        const token = await this.securityModel.create({email});
        this.client.emit('send_token', {email, token: token.token});
        return true;
    }

    async useToken(token: string) {
        const security = await this.securityModel.findOne({where: {token, expiresAt: {[Op.gt]: new Date()}}});
        if(!security) {
            throw new Error('Token is invalid');
        }
        await security.destroy();
        return security;
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteExpiredToken() {
        await this.securityModel.destroy({where: {expiresAt: {[Op.lt]: new Date()}}});
    }
}
