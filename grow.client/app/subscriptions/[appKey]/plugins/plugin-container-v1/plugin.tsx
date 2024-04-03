"use client";

import PluginContainer, { IPluginContainerProps } from "./components/Container";

export default function Plugin({
  components,
  ...props
}: IPluginContainerProps) {
  // console.log("plugin-container-v1", components, width, props);

  if (components === undefined) {
    return null;
  }

  return (
    <>
      <PluginContainer components={components} {...props} />
    </>
  );
}
