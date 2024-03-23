"use client";

import { useEffect, useState } from "react";
import PluginMain from "./components/Main";

interface PagePluginProps {
  pages: {
    [pageKey: string]: Object;
  };
}

export default function Plugin({ pages }: PagePluginProps) {
  // console.log("plugin-page-v1 pages", pages);

  if (pages === undefined) {
    return null;
  }

  return (
    <>
      <PluginMain pages={pages} appKey={"test"} />
    </>
  );
}
