import { IsInt } from "class-validator";

export class PumpCommandDto {
    @IsInt()
    value: number;
}
