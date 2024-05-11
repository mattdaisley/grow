"use client";

import PluginButton from "./components/Button";

export default function Plugin({ label, ...props }) {
  // console.log("plugin-button-v1", label, props);

  if (label?.value === undefined) {
    return null;
  }

  const propValues = {};
  Object.entries(props).forEach(([key, value]) => {
    propValues[key] = value?.value;
  });

  return (
    <>
      <PluginButton label={label?.value ?? ""} {...propValues} />
    </>
  );
}
