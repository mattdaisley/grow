import { DynamicItem } from "../entities/dynamic-item.entity";

export class DynamicItemsResponse {

    [itemKey: string]: DynamicItem[];
}
