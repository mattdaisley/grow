import { Box } from "@mui/material";

import TestThreeJs from "./TestThreeJs";

export default function PluginRobotArm(props) {
  // console.log("PluginRobotArm", props);

   const handleTargetChange = (target) => {
    if (!props?.x || !props?.y || !props?.z) {
      return;
    }

    if (props.x.value !== target.x) {
      props.x.onChange && props.x.onChange(target.x);
    }
    if (props.y.value !== target.y) {
      props.y.onChange && props.y.onChange(target.y);
    }
    if (props.z.value !== target.z) {
      props.z.onChange && props.z.onChange(target.z);
    }
   }

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
            <TestThreeJs
              l1={props.l1.value}
              l2={props.l2.value}
              l3={props.l3.value}
              x={props.x.value}
              y={props.y.value}
              z={props.z.value}
              onTargetChange={handleTargetChange}
            />
          </Box>
        </Box>
      </>
    );
}
