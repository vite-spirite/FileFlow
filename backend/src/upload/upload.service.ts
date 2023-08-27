import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FileTo } from './models/fileTo.model';
import { File } from './models/file.model';
import { CreateFileDto } from './dto/create-file.dto';
import { createReadStream, readFileSync } from 'fs';
import { createDecipheriv } from 'crypto';
import jszip from 'jszip';

@Injectable()
export class UploadService {
    constructor(
        @InjectModel(File) private fileModel: typeof File,
        @InjectModel(FileTo) private fileToModel: typeof FileTo,
        @InjectQueue('zipper') private zipperQueue: Queue,
        @InjectQueue('encryption') private encryptionQueue: Queue,
    ) {}

    async create(files: Express.Multer.File[], data: CreateFileDto) {
        const file = await this.fileModel.create({
            fileName: '',
            from: data.from,
            isEncrypted: false,
            deletedAt: new Date(Date.now() + (60 * 60 * 1000)),
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
    }

    async completeZipFiles(result: {fileName: string, id: number}) {
        const {fileName, id} = result;
        console.log('completeZipFiles', fileName);

        this.encryptionQueue.add("encrypt", result);
    }

    async completeEncryption(result: {fileName: string, iv: string, key: string, id: number}) {
        const file = await this.fileModel.findOne({where: {id: result.id}, include: {all: true}});
        file.fileName = result.fileName;
        file.isEncrypted = true;
        await file.save();

        console.log(`http://localhost:3000/upload/${result.fileName}/${result.key}/${result.iv}`);
        //send email to user with link to download file with password and iv in microservice
    }

    downloadFile(file: string, key: string, iv: string) {
        const filePath = './uploads/encryption/'+file;

        const decipher = createDecipheriv('aes-256-ctr', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
        const stream = createReadStream(filePath);

        const decrypt = stream.pipe(decipher);

        return decrypt;
    }
}
