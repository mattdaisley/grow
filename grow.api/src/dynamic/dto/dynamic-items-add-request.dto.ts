import { IsString } from "class-validator";

export class DynamicItemsAddRequest {

    @IsString()
    itemKey: string;

    items: DynamicAddItem;

    automation?: boolean
}

export class DynamicAddItem {

    [valueKey: string]: DynamicAddItem | string;
}