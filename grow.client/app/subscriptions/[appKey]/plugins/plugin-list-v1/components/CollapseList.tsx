"use client";

import { List } from "@mui/material";

import { CollapseListItem } from "./CollapseListItem";
import { INestedListItems } from "./INestedListItems";
import { Collection } from "../../../store/domain/Collection";


export function CollapseList({
  nestedListItems, dense = false, level = 1, ...props
}: {
  nestedListItems: INestedListItems;
  dense?: boolean;
  level?: number;
  selectedRecord?: Collection;
}) {
  
  // console.log("CollapseList", nestedListItems, level, useAppStateResults);
  
  return (
    <>
      <List dense={dense} disablePadding>
        {Object.entries(nestedListItems).map(([key, listItem]) => {
          return (
            <CollapseListItem
              key={key}
              label={key}
              listItem={listItem}
              dense={dense}
              level={level}
              {...props} />
          );
        })}
      </List>
    </>
  );
}
