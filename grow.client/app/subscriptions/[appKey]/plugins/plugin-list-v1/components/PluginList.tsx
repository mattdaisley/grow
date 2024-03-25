"use client";

import { Box, List } from "@mui/material";
import useCollections from "../../../store/useCollections";
import { PluginListItem } from "./PluginListItem";
import { Collection } from "../../../store/domain/Collection";

export const drawerWidth = 200;

interface IPluginListProps {
  listItemCollection: Collection;
  primary: string;
  secondary: string;
}

export default function PluginList({
  listItemCollection,
  ...props
}: IPluginListProps) {
  // console.log("Rendering PluginMain");

  const listItems = useCollections([listItemCollection]);
  console.log("PluginList", listItems);
  if (!listItems || !listItems[listItemCollection.key]?.records) {
    return null;
  }

  const listItemRecords = listItems[listItemCollection.key].records;

  return (
    <Box sx={{ padding: 2 }}>
      <List>
        {Object.entries(listItemRecords).map(([key, listItemRecord]) => {
          return (
            <PluginListItem
              key={key}
              listItemRecord={listItemRecord}
              {...props}
            />
          );
        })}
      </List>
    </Box>
  );
}
