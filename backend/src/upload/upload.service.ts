import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { statSync } from 'fs';

@Injectable()
export class UploadService {
    constructor(
        @InjectQueue('zipper') private zipperQueue: Queue,
        @InjectQueue('encryption') private encryptionQueue: Queue,
    ) {}

    async create(files: Express.Multer.File[]) {
        this.zipperQueue.add("zipper", {
            files: files
        });
    }

    async completeZipFiles(fileName: string) {
        console.log('completeZipFiles', fileName);

        this.encryptionQueue.add("encrypt", fileName);
    }
}
