"use client";

import { useEffect, useState } from "react";
import PluginList from "./components/PluginList";
import { Collection } from "../../store/domain/Collection";

interface IPluginListProps {
  components: Collection;
  sort_key: string;
  primary: string;
  secondary: string;
}

export default function Plugin({ components, ...props }: IPluginListProps) {
  // console.log("plugin-list-v1", "components", components, "props", props);

  if (components === undefined) {
    return null;
  }

  return (
    <>
      <PluginList listItemCollection={components} {...props} />
    </>
  );
}
