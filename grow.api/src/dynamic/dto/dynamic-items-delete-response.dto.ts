
export class DynamicItemsDeleteResponse {

    [itemKey: string]: DynamicItemsValues[];
}


class DynamicItemsValues {
    valueKey: string;
    
    deleted: boolean;
}