"use client";

import { Record } from "../../../store/domain/Record";


export interface INestedListItems {
  [label: string]: INestedListItem;
}

export interface INestedListItem {
  displayName: string;
  listItemRecord: Record | null;
  nestedListItems: INestedListItems;

}
