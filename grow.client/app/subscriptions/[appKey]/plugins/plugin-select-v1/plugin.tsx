"use client";

import PluginSelect from "./components/Select";

export default function Plugin({ components, value, ...props }) {
  // console.log("plugin-select-v1", components, value, props);
  if (components?.value === undefined) {
    return null;
  }

  const propValues = {};
  Object.entries(props).forEach(([key, value]) => {
    propValues[key] = value?.value;
  });

  return (
    <>
      <PluginSelect
        menuItemsCollection={components.value}
        value={value.value}
        onChange={value.onChange}
        {...propValues}
      />
    </>
  );
}
