import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FileTo } from './models/fileTo.model';
import { File } from './models/file.model';
import { CreateFileDto } from './dto/create-file.dto';
import { createReadStream, readFileSync, rmSync } from 'fs';
import { createDecipheriv } from 'crypto';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SecurityService } from 'src/security/security.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Op } from 'sequelize';

@Injectable()
export class UploadService {
    constructor(
        @InjectModel(File) private fileModel: typeof File,
        @InjectModel(FileTo) private fileToModel: typeof FileTo,
        @InjectQueue('zipper') private zipperQueue: Queue,
        @InjectQueue('encryption') private encryptionQueue: Queue,
        @Inject('MAILER_SERVICE') private client: ClientProxy,
        private SecurityService: SecurityService,
        private jwtService: JwtService,
        private config: ConfigService
    ) {}

    async create(files: Express.Multer.File[], data: CreateFileDto) {

        try {
            const credentials = await this.SecurityService.useToken(data.token);

            const file = await this.fileModel.create({
                fileName: '',
                from: credentials.email,
                isEncrypted: false,
                deletedAt: new Date(new Date().setDate(new Date().getDate() + 7)),
            });
    
            data.to.forEach(async (to) => {
                await this.fileToModel.create({
                    fileId: file.id,
                    email: to
                });
            });
    
            this.zipperQueue.add("zipper", {
                files: files,
                id: file.id
            });

            return true;
        }
        catch(e) {
            return new BadRequestException(e);
        }
    }

    async completeZipFiles(result: {fileName: string, id: number}) {
        const {fileName, id} = result;

        this.encryptionQueue.add("encrypt", result);
    }

    async completeEncryption(result: {fileName: string, iv: string, key: string, id: number}) {
        const file = await this.fileModel.findOne({where: {id: result.id}, include: {all: true}});
        file.fileName = result.fileName;
        file.isEncrypted = true;
        await file.save();

        const fileTos = await this.fileToModel.findAll({where: {fileId: result.id}});
        const targets = fileTos.map((fileTo) => fileTo.email);
        const download = `${this.config.get<string>('APP_DOWLOAD_URL')}/${result.fileName}/` 

        fileTos.forEach(async (target) => {
            const token = this.jwtService.sign({code: target.token, key: result.key, iv: result.iv});
            this.client.emit('notify', {from: file.from, email: target.email, expire: file.deletedAt, download: download+token, fileName: result.fileName});
        });

        const authorToken = this.jwtService.sign({key: result.key, iv: result.iv});

        this.client.emit('confirm_upload', {email: file.from, target: targets, download: download+authorToken, fileName: result.fileName});
    }

    async downloadFile(file: string, token: string) {

        const {code, key, iv} = this.jwtService.verify<{code?: string, key: string, iv: string}>(token);

        if(code) {
            const fileTo = await this.fileToModel.findOne({where: {token: code}, include: [{model: File}]});
            
            if(!fileTo) {
                throw new Error('Invalid token');
            }

            if(!fileTo.isDownloaded) {
                fileTo.isDownloaded = true;
                await fileTo.save();

                this.client.emit('file_downloaded', {author: fileTo.file.from, email: fileTo.email, fileName: file});
            }
        }

        const filePath = './uploads/encryption/'+file;

        const decipher = createDecipheriv('aes-256-ctr', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
        const stream = createReadStream(filePath);

        const decrypt = stream.pipe(decipher);

        return decrypt;
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteExpiredFile() {
        const files = await this.fileModel.findAll({where: {deletedAt: {[Op.lt]: new Date()}}, include: {all: true}});
        
        files.forEach(async (file) => {
            if(file.isEncrypted) {
                rmSync('./uploads/encryption/'+file.fileName);
            }

            await file.to.forEach(async (fileTo) => {
                await fileTo.destroy();
            });

            await file.destroy();
        });
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteZipperCompletedTask() {
        const zipper = await this.zipperQueue.getCompleted();
        zipper.forEach(async (job) => {
            await job.remove();
        });
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteEncryptionCompletedTask() {
        const encryption = await this.encryptionQueue.getCompleted();
        encryption.forEach(async (job) => {
            await job.remove();
        });
    }
}
