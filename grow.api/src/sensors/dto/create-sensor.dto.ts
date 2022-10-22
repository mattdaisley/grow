import { IsNumber, IsString } from "class-validator";

export class CreateSensorDto {
    @IsString()
    index: number;

    @IsNumber()
    offset: number;

    @IsString()
    name: string;
}
