"use client";

import { Record } from "../../../store/domain/Record";


export interface INestedListItems {
  [label: string]: INestedListItem;
}

export interface INestedListItem {
  listItemRecord: Record | null;
  nestedListItems: INestedListItems;

}
