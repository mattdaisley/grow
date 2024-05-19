"use client";

import PluginButton from "./components/ButtonGroup";

export default function Plugin({ components, ...props }) {
  // console.log("plugin-button-group-v1", "components", components, "props", props);

  if (components?.value === undefined) {
    return null;
  }

  const propValues = {};
  Object.entries(props).forEach(([key, value]) => {
    propValues[key] = value?.value;
  });

  return (
    <>
      <PluginButton buttonsCollection={components.value} {...propValues} />
    </>
  );
}