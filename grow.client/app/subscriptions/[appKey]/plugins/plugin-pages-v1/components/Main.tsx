"use client";

import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import useCollections from "../../../store/useCollections";
import { PluginPage } from "./PluginPage";
import useAppState from "../../../store/useAppState";

export default function PluginMain({ pagesCollection, filter, selectedRecord: selectedRecordValue }) {
  // console.log("Rendering PluginMain", filter, selectedRecordValue);
  const { selectedRecord } = useAppState("selectedRecord");
  const { appBarHeight } = useAppState("appBarHeight", false);
  const { drawerHeight } = useAppState("drawerHeight", false);
  const { drawerWidth } = useAppState("drawerWidth", false);

  const [lastSelectedRecordValue, setLastSelectedRecordValue] = useState();

  const pages = useCollections([pagesCollection]);
  // console.log(
  //   "PluginMain",
  //   pages,
  //   pagesCollection,
  //   selectedRecord,
  //   appBarHeight,
  //   drawerHeight,
  //   drawerWidth
  // );

  useEffect(() => {
    // console.log(
    //   "PluginMain selectedRecordValue",
    //   lastSelectedRecordValue,
    //   selectedRecordValue,
    //   selectedRecord?.value
    // );
    if (
      selectedRecordValue !== undefined &&
      (selectedRecord?.value !== selectedRecordValue || lastSelectedRecordValue === undefined) &&
      lastSelectedRecordValue !== selectedRecordValue &&
      selectedRecord?.onChange !== undefined
    ) {
      setLastSelectedRecordValue(selectedRecordValue);
      selectedRecord.onChange(selectedRecordValue);
    }
  }, [selectedRecord?.value, selectedRecord?.onChange, selectedRecordValue, lastSelectedRecordValue]);

  if (!pages || !pages[pagesCollection.key]?.records) {
    return null;
  }

  const pageRecords = pages[pagesCollection.key].records;
  // console.log("PluginMain pageRecords", pageRecords, filter);

  let sortedPages = Object.entries(pageRecords);
  const sort_key = 'sortOrder';

  if (
    Object.values(pagesCollection.schema.fields)
      .map((f: any) => f.name)
      .includes(sort_key)
  ) {
    sortedPages.sort((a, b) => {
      // console.log(a, b);
      if (a[1].value[sort_key] < b[1].value[sort_key]) {
        return -1;
      }
      if (a[1].value[sort_key] > b[1].value[sort_key]) {
        return 1;
      }
      return 0;
    });
  }

  const drawerWidthPixels =
    drawerWidth?.value && drawerWidth.value !== ""
      ? parseInt(drawerWidth.value)
      : 0;
  const appBarPixels =
    appBarHeight?.value && appBarHeight.value !== ""
      ? parseInt(appBarHeight.value)
      : 0;
  const drawerPixels =
    drawerHeight?.value && drawerHeight.value !== ""
      ? parseInt(drawerHeight.value)
      : 0;

  return (
    <Box
      data-plugin="plugin-pages-v1"
      component="main"
      sx={(theme) => {
        return {
          flexGrow: 1,
          boxSizing: "border-box",
          pl: {
            xs: 2,
            md: `calc(${theme.spacing(4)} + ${drawerWidthPixels}px)`,
          },
          pr: { xs: 2, md: 4 },
          // width: {sm: `calc(100% - ${drawerWidth?.value}px)` },
          width: 1,
          height: 1,
          maxHeight: `calc(100% - ${appBarPixels}px - ${drawerPixels}px)`,
          // position: "fixed",
          // overflowY: "scroll",
        };
      }}
    >
      {sortedPages.map(([key, pageRecord]) => {
        return <PluginPage key={key} pageRecord={pageRecord} filter={filter} />;
      })}
    </Box>
  );
}
