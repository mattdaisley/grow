"use client";

import { useEffect, useState } from "react";
import PluginMain from "./components/Main";

interface IPluginPagesProps {
  pagesCollection: {
    [pageKey: string]: Object;
  };
}

export default function Plugin({ pagesCollection }: IPluginPagesProps) {
  // console.log("plugin-page-v1 pages", pagesCollection);

  if (pagesCollection === undefined) {
    return null;
  }

  return (
    <>
      <PluginMain pagesCollection={pagesCollection} appKey={"test"} />
    </>
  );
}
