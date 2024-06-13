"use client";

import Grid from "@mui/material/Unstable_Grid2";

import useCollections from "../../../store/useCollections";
import { Collection } from "../../../store/domain/Collection";
import { Record } from "../../../store/domain/Record";
import { CollapseList } from "./CollapseList";
import { INestedListItems } from "./INestedListItems";
import useRecords from "../../../store/useRecords";

interface IPluginListProps {
  listItemCollection: Collection;
  selectedRecord?: any;
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
  selectedRecord,
  dense,
  padding,
  px,
  py,
  sort_key,
  ...props
}: IPluginListProps) {
  // console.log("Rendering PluginList listItemCollection", listItemCollection);

  const recordFieldRequest = {
    selectedRecord: {
      record: selectedRecord?.record,
    },
  };

  const useRecordResults = useRecords(recordFieldRequest);
  const listItemsResponse = useCollections([listItemCollection]);
  // console.log(
  //   "PluginList listItemsResponse",
  //   listItemsResponse,
  //   "useRecordResults", useRecordResults
  // );
  if (
    !listItemsResponse ||
    !listItemsResponse[listItemCollection.key]?.records
  ) {
    return null;
  }

  const listItemRecords = listItemsResponse[listItemCollection.key].records;
  // console.log("PluginList listItemRecords", listItemRecords);

  let listItems = Object.entries(listItemRecords);

  sortListItems(sort_key, listItems);

  const nestedListItems = transformList(listItems);
  // console.log("nestedListItems", nestedListItems)


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
        {
          <CollapseList
            dense={dense}
            nestedListItems={nestedListItems}
            selectedRecord={useRecordResults.selectedRecord?.value}
            {...props}
          />
        }
      </Grid>
    </>
  );
}

type ListItemRecord = {
  display_name: string;
}

function sortListItems(sort_key: string, listItems: [string, Record<ListItemRecord>][]) {
  if (sort_key) {
    listItems.sort((a, b) => {
      // console.log(a, b);
      if (a[1].value.display_name < b[1].value.display_name) {
        return -1;
      }
      if (a[1].value.display_name > b[1].value.display_name) {
        return 1;
      }
      return 0;
    });
  }
}

function transformList(listItems): INestedListItems {
  let result: INestedListItems = {};

  listItems.forEach(([itemKey, item]) => {
    let keys = item.value.display_name.split("/");
    let currentLevel = result;
    let currentDisplayName = '';

    keys.forEach((key, index) => {
      if (!currentLevel[key]) {
        currentLevel[key] = {
          displayName: currentDisplayName,
          listItemRecord: null,
          nestedListItems: {},
        };
      }

      if (index === keys.length - 1) {
        currentLevel[key].listItemRecord = item;
      }
      
      currentDisplayName = currentDisplayName
        ? `${currentDisplayName}/${key}`
        : key;

      currentLevel[key].displayName = currentDisplayName;

      currentLevel = currentLevel[key].nestedListItems;
    });
  });

  return result;
}


