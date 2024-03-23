"use client";

import { Box } from "@mui/material";
import useCollection from "../../../store/useCollection";
import { ExamplePage } from "./ExamplePage";
import { PluginPage } from "./PluginPage";

export const drawerWidth = 200;

export default function PluginMain(props) {
  // console.log("Rendering PluginMain");

  const segment = props.appKey;

  const pages = useCollection(props.pages);
  console.log(pages);

  return (
    <Box
      component="main"
      sx={(theme) => {
        // // console.log(theme, theme.spacing(2))
        return {
          flexGrow: 1,
          pl: { xs: 0, md: `${drawerWidth}px` },
          // width: {sm: `calc(100% - ${drawerWidth}px)` },
          width: 1,
          // height: "100%",
          // position: "fixed",
          // overflowY: "scroll",
        };
      }}
    >
      {Object.entries(pages).map(([key, page]) => {
        return <PluginPage key={key} page={page} />;
      })}
      {/* <ExamplePage /> */}
    </Box>
  );
}
