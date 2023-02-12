import { IsString } from "class-validator";

export class DynamicItemsRequest {

    @IsString()
    itemKey: string;

    values?: DynamicItemsValues
}

class DynamicItemsValues {
    [valueKey: string]: string;
}