"use client";

import { Box, List } from "@mui/material";
import useCollections from "../../../store/useCollections";
import { PluginListItem } from "./PluginListItem";
import { Collection } from "../../../store/domain/Collection";

export const drawerWidth = 200;

interface IPluginListProps {
  listItemCollection: Collection;
  sort_key?: string;
  primary?: string;
  secondary?: string;
}

export default function PluginList({
  listItemCollection,
  ...props
}: IPluginListProps) {
  // console.log("Rendering PluginList listItemCollection", listItemCollection);

  const listItemsResponse = useCollections([listItemCollection]);
  // console.log("PluginList listItemsResponse", listItemsResponse);
  if (
    !listItemsResponse ||
    !listItemsResponse[listItemCollection.key]?.records
  ) {
    return null;
  }

  const listItemRecords = listItemsResponse[listItemCollection.key].records;
  // console.log("PluginList listItemRecords", listItemRecords);

  let listItems = Object.entries(listItemRecords);

  if (props.sort_key) {
    listItems.sort((a, b) => {
      // console.log(a, b);
      if (a[1].value["display_name"] < b[1].value["display_name"]) {
        return -1;
      }
      if (a[1].value["display_name"] > b[1].value["display_name"]) {
        return 1;
      }
      return 0;
    });
  }

  return (
    <>
      <Box sx={{ padding: 2 }}>
        <List>
          {listItems.map(([key, listItemRecord]) => {
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
    </>
  );
}
