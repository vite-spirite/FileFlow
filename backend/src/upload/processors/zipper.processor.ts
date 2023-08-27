import { OnQueueActive, OnQueueCompleted, Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { UploadService } from "../upload.service";
import * as JSZip from "jszip";
import { mkdir, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { customAlphabet } from "nanoid";

@Processor('zipper')
export class ZipperProcessor {

    private nanoid: (size?: number) => string;

    constructor(private uploadFileService: UploadService) {
        this.nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 32);
    }

    @Process('zipper')
    async zipper(job: Job<{files: Express.Multer.File[], id: number}>) {
        console.log("Start")
        const {files} = job.data;

        const zip = JSZip();

        files.forEach(file => {
            const buffer = readFileSync(file.path);
            zip.file(file.originalname, buffer);
        });


        const zipName = this.nanoid(32)+'.zip';

        const content = await zip.generateAsync({type: "nodebuffer", compression: "DEFLATE", compressionOptions: {level: 9}});
        mkdirSync('./uploads/zipper', {recursive: true});
        writeFileSync('./uploads/zipper/'+zipName, content);


        files.forEach(file => {
            rmSync(file.path);
        });

        console.log("Done");
        return {fileName: zipName, id: job.data.id};
    }

    @OnQueueCompleted()
    async onCompleted(job: Job<any>, result: any) {
        await this.uploadFileService.completeZipFiles(result);
    }
}