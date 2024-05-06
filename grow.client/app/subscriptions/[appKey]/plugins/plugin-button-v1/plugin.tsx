"use client";

import PluginButton from "./components/Button";

export default function Plugin({
  label,
  clickAction,
  appStateKey,
  appStateValue,
  ...props
}) {
  // console.log("plugin-button-v1", label, clickAction, props);

  if (label?.value === undefined) {
    return null;
  }

  return (
    <>
      <PluginButton
        label={label?.value ?? ""}
        clickAction={clickAction?.value}
        appStateKey={appStateKey}
        appStateValue={appStateValue}
        {...props}
      />
    </>
  );
}
