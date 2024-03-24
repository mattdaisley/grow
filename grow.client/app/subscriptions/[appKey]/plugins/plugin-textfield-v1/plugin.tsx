"use client";

import PluginTextField from "./components/TextField";

export default function Plugin({ value, label, ...props }) {
  if (value === undefined) {
    return null;
  }

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
