import { Process, Processor } from '@nestjs/bull';
import { UploadService } from '../upload.service';
import { Job } from 'bull';
import { nanoid } from 'nanoid';
import { createCipheriv, randomBytes, scryptSync } from 'crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

@Processor('encryption')
export class EncryptionProcessor {
    constructor(private uploadFileService: UploadService) {}

    @Process('encrypt')
    async encrypt(job: Job<string>) {
        const password = nanoid(64);
        const iv = randomBytes(16);
        const key = scryptSync(password, nanoid(12), 32);

        const cipher = createCipheriv('aes-256-ctr', key, iv);
        const file = readFileSync('./uploads/zipper/'+job.data);
        console.log(nanoid(12));

        const encrypted = Buffer.concat([cipher.update(file), cipher.final()]);

        mkdirSync('./uploads/encryption', {recursive: true});
        const fileName = nanoid(32)+'.enc';
        const filePath = './uploads/encryption/'+fileName;
        writeFileSync(filePath, Buffer.concat([iv, encrypted]));

        rmSync('./uploads/zipper/'+job.data);

        return {
            fileName: fileName,
            iv: iv.toString('hex'),
            key: key.toString('hex'),
        };
    }
}