"use client";

import { useEffect, useState } from "react";
import PluginMain from "./components/Main";

interface IPluginPagesProps {
  pagesCollection: {
    [pageKey: string]: Object;
  };
  filter?: string[];
}

export default function Plugin({
  pagesCollection,
  filter,
  ...props
}: IPluginPagesProps) {
  // console.log("plugin-page-v1 pages", pagesCollection, filter, props);

  if (pagesCollection === undefined) {
    return null;
  }

  return (
    <>
      <PluginMain pagesCollection={pagesCollection} filter={filter} />
    </>
  );
}
