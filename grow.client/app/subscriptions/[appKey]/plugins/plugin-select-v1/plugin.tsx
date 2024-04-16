"use client";

import PluginSelect from "./components/Select";

export default function Plugin({ components, value, label, ...props }) {
  if (components?.value === undefined) {
    return null;
  }
  // console.log("plugin-select-v1", value, label, props);

  return (
    <>
      <PluginSelect
        menuItemsCollection={components.value}
        value={value.value}
        label={label?.value ?? ""}
        onChange={value.onChange}
        {...props}
      />
    </>
  );
}
