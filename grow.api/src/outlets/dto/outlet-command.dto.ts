import { IsInt } from "class-validator";

export class OutletCommandDto {
    @IsInt()
    value: number;
}
