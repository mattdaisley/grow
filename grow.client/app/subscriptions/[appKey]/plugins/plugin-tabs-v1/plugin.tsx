"use client";

import PluginTabs from "./components/Tabs";

export default function Plugin({ components, tabs, ...props }) {
  // console.log("plugin-tabs-v1", components, props);

  if (components === undefined || tabs === undefined) {
    return null;
  }

  const propValues = {};
  Object.entries(props).forEach(([key, value]) => {
    propValues[key] = value?.value;
  });

  return (
    <>
      <PluginTabs
        tabsCollection={tabs.value}
        components={components.value}
        {...propValues}
      />
    </>
  );
}
