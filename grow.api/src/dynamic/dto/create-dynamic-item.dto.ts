import { IsString } from "class-validator";

export class CreateDynamicItemDto {

    @IsString()
    itemKey: string;

    @IsString()
    valueKey: string;

    @IsString()
    value: string;
}
