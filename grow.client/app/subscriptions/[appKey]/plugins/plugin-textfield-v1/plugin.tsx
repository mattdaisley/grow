"use client";

import PluginTextField from "./components/TextField";

export default function Plugin({ value, ...props }) {
  if (value === undefined) {
    return null;
  }
  // console.log("plugin-textfield-v1", value, props);

  const propValues = {};
  Object.entries(props).forEach(([key, value]) => {
    propValues[key] = value.value;
  });

  return (
    <>
      <PluginTextField
        value={value.value}
        onChange={value.onChange}
        {...propValues}
      />
    </>
  );
}
