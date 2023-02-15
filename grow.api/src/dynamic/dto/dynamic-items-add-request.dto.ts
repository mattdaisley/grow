import { IsString } from "class-validator";

export class DynamicItemsAddRequest {

    @IsString()
    itemKey: string;

    @IsString()
    valueKeyPrefix: string;

    @IsString()
    valueKeySuffix: string;

    @IsString()
    value: string;
}