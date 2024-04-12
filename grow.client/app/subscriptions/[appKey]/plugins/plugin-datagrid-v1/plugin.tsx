"use client";

import { useEffect, useState } from "react";
import PluginDataGrid from "./components/PluginDataGrid";
import { Collection } from "../../store/domain/Collection";

interface IPluginDataGridProps {
  components: Collection;
  height?: string;
}

export default function Plugin({ components, ...props }: IPluginDataGridProps) {
  // console.log("plugin-datagrid-v1", "components", components, "props", props);

  if (components === undefined || typeof components === "string") {
    return null;
  }

  return (
    <>
      <PluginDataGrid dataSource={components} {...props} />
    </>
  );
}
