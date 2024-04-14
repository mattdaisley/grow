"use client";

import { useEffect, useState } from "react";
import PluginDataGrid from "./components/PluginDataGrid";
import { Collection } from "../../store/domain/Collection";

export default function Plugin({ components, ...props }) {
  // console.log("plugin-datagrid-v1", "components", components, "props", props);

  if (components?.value === undefined || typeof components.value === "string") {
    return null;
  }

  const propValues = {};
  Object.entries(props).forEach(([key, value]) => {
    propValues[key] = value.value;
  });

  return (
    <>
      <PluginDataGrid dataSource={components.value} {...propValues} />
    </>
  );
}
