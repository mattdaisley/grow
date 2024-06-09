"use client";

import { List } from "@mui/material";

import { CollapseListItem } from "./CollapseListItem";
import { INestedListItems } from "./INestedListItems";
import { Collection } from "../../../store/domain/Collection";
import useAppState from "../../../store/useAppState";
import useRecords from "../../../store/useRecords";
import { Record } from "../../../store/domain/Record";


export function CollapseList({
  nestedListItems,
  dense = false,
  level = 1,
  selectedRecord,
  ...props
}: {
  nestedListItems: INestedListItems;
  dense?: boolean;
  level?: number;
  selectedRecord?: Collection;
}) {
  // console.log("CollapseList", nestedListItems, level, selectedRecord);

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
              selectedRecord={selectedRecord}
              {...props}
            />
          );
        })}
      </List>
    </>
  );
}
