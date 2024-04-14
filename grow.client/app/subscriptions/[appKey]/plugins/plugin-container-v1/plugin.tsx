"use client";

import PluginContainer, { IPluginContainerProps } from "./components/Container";

export default function Plugin({ components, ...props }) {
  // console.log("plugin-container-v1", components, props);

  if (components === undefined) {
    return null;
  }

  const propValues = {};
  Object.entries(props).forEach(([key, value]) => {
    propValues[key] = value.value;
  });

  return (
    <>
      <PluginContainer components={components.value} {...propValues} />
    </>
  );
}
