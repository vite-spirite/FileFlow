import { IsEmail, IsDate } from "class-validator"

export class CreateFileDto {
    @IsEmail()
    from: string;

    @IsEmail({}, {each: true})
    to: string[];

    //@IsDate()
    expiration: Date;
}