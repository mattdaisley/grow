"use client";

import { Box, List } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import useCollections from "../../../store/useCollections";
import { Collection } from "../../../store/domain/Collection";
import { PluginListItem } from "./PluginListItem";

interface IPluginListProps {
  listItemCollection: Collection;
  sort_key?: string;
  primary?: string;
  secondary?: string;
  padding?: string;
  px?: string;
  py?: string;
  dense?: boolean;
}

export default function PluginList({
  listItemCollection,
  dense,
  padding,
  px,
  py,
  sort_key,
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

  if (sort_key) {
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
      <Grid
        data-plugin="plugin-list-v1"
        xs={12}
        sx={{
          padding: padding ? Number(padding ?? 0) : undefined,
          px: px ? Number(px ?? 0) : undefined,
          py: py ? Number(py ?? 0) : undefined,
        }}
      >
        <List dense={dense}>
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
      </Grid>
    </>
  );
}
