"use client";

import { Box } from "@mui/material";
import useCollections from "../../../store/useCollections";
import { ExamplePage } from "./ExamplePage";
import { PluginPage } from "./PluginPage";

export const drawerWidth = 200;

export default function PluginMain({ pagesCollection, filter }) {
  // console.log("Rendering PluginMain");

  const pages = useCollections([pagesCollection]);
  // console.log("PluginMain", pages);
  if (!pages || !pages[pagesCollection.key]?.records) {
    return null;
  }

  const pageRecords = pages[pagesCollection.key].records;

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
          // height: "100%",
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
