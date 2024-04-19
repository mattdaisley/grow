"use client";

import PluginTextField from "./components/TextField";

export default function Plugin({ value, label, readonly, ...props }) {
  if (value === undefined) {
    return null;
  }
  // console.log("plugin-textfield-v1", value, label, props);

  return (
    <>
      <PluginTextField
        value={value.value}
        label={label?.value ?? ""}
        readonly={readonly?.value ?? false}
        onChange={value.onChange}
        {...props}
      />
    </>
  );
}
