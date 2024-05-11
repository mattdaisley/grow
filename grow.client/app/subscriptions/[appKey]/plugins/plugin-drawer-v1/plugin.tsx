"use client";

import PluginDrawer from "./components/PluginDrawer";

export default function Plugin({ components, header_components, ...props }) {
  // console.log("plugin-drawer-v1", components, header_components);

  if (components === undefined) {
    return null;
  }

  const propValues = {};
  Object.entries(props).forEach(([key, value]) => {
    propValues[key] = value?.value;
  });

  return (
    <>
      <PluginDrawer
        components={components.value}
        headerComponents={header_components?.value}
        {...propValues}
      />
    </>
  );
}
