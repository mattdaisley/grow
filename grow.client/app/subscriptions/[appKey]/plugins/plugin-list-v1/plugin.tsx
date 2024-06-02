"use client";

import PluginList from "./components/PluginList";

export default function Plugin({ components, ...props }) {
  // console.log("plugin-list-v1", "components", components, "props", props);

  if (components?.value === undefined) {
    return null;
  }

  const propValues = {};
  Object.entries(props).forEach(([key, value]) => {
    propValues[key] = value?.value;
  });

  return (
    <>
      <PluginList listItemCollection={components.value} {...propValues} />
    </>
  );
}
