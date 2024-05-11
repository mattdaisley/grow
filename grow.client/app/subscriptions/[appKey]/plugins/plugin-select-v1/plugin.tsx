"use client";

import PluginSelect from "./components/Select";

export default function Plugin({ value, components, ...props }) {
  // console.log("plugin-select-v1", value, props);
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
