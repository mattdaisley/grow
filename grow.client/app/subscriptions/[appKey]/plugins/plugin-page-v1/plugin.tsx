"use client";

import { useEffect, useState } from "react";
import PluginMain from "./components/Main";

interface PagePluginProps {
  pages: {
    [pageKey: string]: Object;
  };
}

export default function Plugin({ pages }: PagePluginProps) {
  if (pages === undefined) {
    return null;
  }

  return (
    <>
      <PluginMain pages={pages} appKey={"test"} />
    </>
  );
}
