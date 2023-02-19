import { IsString } from "class-validator";

export class DynamicItemsDeleteRequest {

    @IsString()
    itemKey: string;

    items?: DynamicDeletedItems
}

class DynamicDeletedItems {
    [valueKey: string]: string;
}