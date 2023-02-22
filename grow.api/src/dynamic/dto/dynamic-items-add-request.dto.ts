import { IsString } from "class-validator";

export class DynamicItemsAddRequest {

    @IsString()
    itemKey: string;

    items: DynamicAddItem;
}

export class DynamicAddItem {

    [valueKey: string]: DynamicAddItem | string;
}