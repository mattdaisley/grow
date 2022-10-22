import { IsDecimal } from "class-validator";

export class CreateSensorReadingDto {
    @IsDecimal()
    value: number;
}
