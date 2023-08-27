import { OnQueueActive, OnQueueCompleted, Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { UploadService } from "../upload.service";
import * as JSZip from "jszip";
import { mkdir, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { nanoid } from "nanoid";

@Processor('zipper')
export class ZipperProcessor {

    constructor(private uploadFileService: UploadService) {}

    @Process('zipper')
    async zipper(job: Job<{files: Express.Multer.File[]}>) {
        console.log("Start")
        const {files} = job.data;

        const zip = JSZip();

        files.forEach(file => {
            const buffer = readFileSync(file.path);
            zip.file(file.originalname, buffer);
        });


        const zipName = nanoid(32)+'.zip';

        const content = await zip.generateAsync({type: "nodebuffer"});
        mkdirSync('./uploads/zipper', {recursive: true});
        writeFileSync('./uploads/zipper/'+zipName, content);

        files.forEach(file => {
            rmSync(file.path);
        });

        console.log("Done");
        return zipName;
    }

    @OnQueueCompleted()
    async onCompleted(job: Job<any>, result: any) {
        console.log(`Completed job ${job.id} of type ${job.name}, result: ${result}`);
        await this.uploadFileService.completeZipFiles(result);
    }
}