"use client";

import { Box } from "@mui/material";
import useCollections from "../../../store/useCollections";
import { ExamplePage } from "./ExamplePage";
import { PluginPage } from "./PluginPage";
import { SubscriptionStoreContext } from "../../../store/SubscriptionStoreContext";
import { useContext } from "react";
import useAppState from "../../../store/useAppState";
// import { drawerWidth } from './../../../../../testing/[dynamic]/DynamicAppDrawer';

// export const drawerWidth = 200;

export default function PluginMain({ pagesCollection, filter }) {
  // console.log("Rendering PluginMain");
  const appState = useAppState();
  const drawerWidth = appState.drawerWidth ?? 0;
  const appBarHeight = appState.appBarHeight ?? 0;

  const pages = useCollections([pagesCollection]);
  // console.log("PluginMain", pages, pagesCollection);
  if (!pages || !pages[pagesCollection.key]?.records) {
    return null;
  }

  const pageRecords = pages[pagesCollection.key].records;
  // console.log("PluginMain pageRecords", pageRecords, filter);

  return (
    <Box
      component="main"
      sx={(theme) => {
        return {
          flexGrow: 1,
          pl: { xs: 2, md: `calc(${theme.spacing(4)} + ${drawerWidth}px)` },
          pr: { xs: 2, md: 4 },
          // width: {sm: `calc(100% - ${drawerWidth}px)` },
          width: 1,
          height: 1,
          maxHeight: `calc(100% - ${appBarHeight}px)`,
          // position: "fixed",
          // overflowY: "scroll",
        };
      }}
    >
      {Object.entries(pageRecords).map(([key, pageRecord]) => {
        return <PluginPage key={key} pageRecord={pageRecord} filter={filter} />;
      })}
      {/* <ExamplePage /> */}
    </Box>
  );
}
