import { Box, Button, ButtonGroup } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import TestThreeJs from "./TestThreeJs";

export default function PluginRobotArm(props) {
  // console.log("PluginIFrame", props.src);

    return (
      <>
        <Box
          data-plugin="plugin-robot-arm-v1"
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            backgroundColor: "black",
            color: "white",
            fontSize: "1.5rem",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              p: 4,
              display: "flex",
              flexAlign: "center",
              justifyContent: "center",
            }}
          >
            <TestThreeJs />
          </Box>
        </Box>
      </>
    );
}
