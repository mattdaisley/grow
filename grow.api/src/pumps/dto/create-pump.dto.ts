import { IsInt, IsNumber, IsString } from "class-validator";

export class CreatePumpDto {
    @IsInt()
    index: number;

    @IsNumber()
    doseRate: number;

    @IsString()
    name: string;
}
