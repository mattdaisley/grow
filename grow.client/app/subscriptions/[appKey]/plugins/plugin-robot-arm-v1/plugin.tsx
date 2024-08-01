"use client";

import PluginRobotArm from "./components/PluginRobotArm";

export default function Plugin({ src, ...props }) {
  if (src === undefined) {
    return null;
  }
  // console.log("plugin-iframe-v1", src, props);

  return (
    <>
      <PluginRobotArm src={src?.value ?? src} {...props} />
    </>
  );
}
