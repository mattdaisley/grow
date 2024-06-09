"use client";

import PluginList from "./components/PluginList";

export default function Plugin({ components, selectedRecord, ...props }) {
  // console.log("plugin-list-v1", "selectedRecord", props.selectedRecord.value.schema.display_name);
  // console.log("plugin-list-v1", "components", components, "selectedRecord", selectedRecord, "props", props);

  if (components?.value === undefined) {
    return null;
  }

  const propValues = {};
  Object.entries(props).forEach(([key, value]) => {
    propValues[key] = value?.value;
  });

  return (
    <>
      <PluginList
        listItemCollection={components.value}
        selectedRecord={selectedRecord}
        {...propValues}
      />
    </>
  );
}
