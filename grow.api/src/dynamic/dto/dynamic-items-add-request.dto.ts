import { IsString } from "class-validator";

export class DynamicItemsAddRequest {

    @IsString()
    itemKey: string;

    items: DynamicAddItem[]
}

class DynamicAddItem {

    @IsString()
    prefix: string;

    @IsString()
    suffix: string;

    @IsString()
    value: string;
}