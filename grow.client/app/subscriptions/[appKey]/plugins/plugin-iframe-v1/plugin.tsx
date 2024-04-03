"use client";

import PluginIFrame from "./components/PluginIFrame";

export default function Plugin({ src, ...props }) {
  if (src === undefined) {
    return null;
  }
  // console.log("plugin-iframe-v1", src, props);

  return (
    <>
      <PluginIFrame src={src?.value ?? src} {...props} />
    </>
  );
}
