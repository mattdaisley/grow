"use client";

import PluginTextField from "./components/TextField";

export default function Plugin({ value, label, ...props }) {
  if (value === undefined) {
    return null;
  }
  console.log("plugin-textfield-v1", value, label, props);

  return (
    <>
      <PluginTextField
        value={value.value}
        label={label?.value ?? ""}
        onChange={value.onChange}
        {...props}
      />
    </>
  );
}
