"use client";

import PluginRobotArm from "./components/PluginRobotArm";

export default function Plugin({ ...props }) {
  // console.log("plugin-robot-arm-v1", props);

  return (
    <>
      <PluginRobotArm {...props} />
    </>
  );
}
