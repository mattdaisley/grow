import { IsInt, IsNumber, IsString } from "class-validator";

export class CreateOutletDto {
    @IsInt()
    index: number;

    @IsString()
    name: string;
}
