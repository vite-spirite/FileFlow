import { IsEmail, IsString } from "class-validator"

export class CreateFileDto {
    @IsString()
    token: string;

    @IsEmail({}, {each: true})
    to: string[];

    //@IsDate()
    expiration: Date;
}