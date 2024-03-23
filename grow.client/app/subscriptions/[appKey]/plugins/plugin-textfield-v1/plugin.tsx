"use client";

import PluginTextField from "./components/TextField";

export default function Plugin({ value, label, onChange, ...props }) {
  if (value === undefined) {
    return null;
  }

  return (
    <>
      <PluginTextField
        value={value}
        label={label}
        onChange={onChange}
        {...props}
      />
    </>
  );
}
