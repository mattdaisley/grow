"use client";

import { useEffect, useState } from "react";
import { Collapse, ListItemButton, ListItemText } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

import { PluginListItem } from "./PluginListItem";
import { INestedListItem } from "./INestedListItems";
import { CollapseList } from "./CollapseList";
import { Collection } from "../../../store/domain/Collection";

export function CollapseListItem({
  label, listItem, dense, level, selectedRecord, ...props
}: {
  label: string;
  listItem: INestedListItem;
  dense: boolean;
  level: number;
  selectedRecord?: Collection;
}) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };
  const hasNestedListItems = Object.keys(listItem.nestedListItems).length > 0;
  // console.log(
  //   "CollapseListItem",
  //   // label,
  //   // listItem,
  //   // level,
  //   // hasNestedListItems,
  //   (listItem.listItemRecord?.value as any)?.display_name,
  //   selectedRecord,
  //   selectedRecord?.schema?.display_name
  // );

  const matchesSelectedRecord =
    selectedRecord?.schema?.display_name.indexOf(listItem.displayName+"/") === 0;
  
  // console.log(
  //   "CollapseListItem matchesSelectedRecord",
  //   selectedRecord?.schema?.display_name,
  //   matchesSelectedRecord,
  //   listItem.displayName
  // );

  useEffect(() => {
    if (matchesSelectedRecord) {
      setOpen(true);
    }
  }, [matchesSelectedRecord]);


  return (
    <>
      {listItem.listItemRecord !== null ? (
        <PluginListItem
          listItemRecord={listItem.listItemRecord}
          // onClick={handleClick}
          sx={{ pl: level * 2 }}
          {...props}
        >
          {hasNestedListItems &&
            (open ? (
              <ExpandLess onClick={handleClick} />
            ) : (
              <ExpandMore onClick={handleClick} />
            ))}
        </PluginListItem>
      ) : (
        <ListItemButton onClick={handleClick} sx={{ pl: level * 2 }}>
          <ListItemText primary={label} />
          {hasNestedListItems && (open ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      )}
      {hasNestedListItems && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <CollapseList
            nestedListItems={listItem.nestedListItems}
            dense={dense}
            level={level + 1}
            selectedRecord={selectedRecord}
            {...props}
          />
        </Collapse>
      )}
    </>
  );
}
