import { IsString } from "class-validator";

export class DynamicItemsAddRequest {

    @IsString()
    itemKey: string;

    @IsString()
    valueKeyPrefix: string;

    @IsString()
    value: string;
}