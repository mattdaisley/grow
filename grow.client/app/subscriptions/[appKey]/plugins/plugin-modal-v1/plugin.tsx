"use client";

import PluginModal from "./components/PluginModal";

export default function Plugin({ components, appStateKey, ...props }) {
  // console.log("plugin-modal-v1", components, appStateKey, props);

  if (components === undefined || appStateKey === undefined) {
    return null;
  }

  const propValues = {};
  Object.entries(props).forEach(([key, value]) => {
    propValues[key] = value?.value;
  });

  return (
    <>
      <PluginModal
        components={components}
        appStateKey={appStateKey.value}
        {...propValues}
      />
    </>
  );
}
