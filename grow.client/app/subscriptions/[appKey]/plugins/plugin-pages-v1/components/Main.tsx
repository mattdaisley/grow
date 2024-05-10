"use client";

import { Box } from "@mui/material";

import useCollections from "../../../store/useCollections";
import { PluginPage } from "./PluginPage";
import useAppState from "../../../store/useAppState";
// import { drawerWidth } from './../../../../../testing/[dynamic]/DynamicAppDrawer';

// export const drawerWidth = 200;

export default function PluginMain({ pagesCollection, filter }) {
  // console.log("Rendering PluginMain");
  const { appBarHeight } = useAppState("appBarHeight");
  const { drawerHeight } = useAppState("drawerHeight");
  const { drawerWidth } = useAppState("drawerWidth");

  const pages = useCollections([pagesCollection]);
  // console.log(
  //   "PluginMain",
  //   pages,
  //   pagesCollection,
  //   appBarHeight,
  //   drawerHeight,
  //   drawerWidth
  // );
  if (!pages || !pages[pagesCollection.key]?.records) {
    return null;
  }

  const pageRecords = pages[pagesCollection.key].records;
  // console.log("PluginMain pageRecords", pageRecords, filter);

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
      {Object.entries(pageRecords).map(([key, pageRecord]) => {
        return <PluginPage key={key} pageRecord={pageRecord} filter={filter} />;
      })}
    </Box>
  );
}
