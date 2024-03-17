"use client";

import { useEffect, useState } from "react";
import PluginNavDrawer from "./components/NavDrawer";

interface NavDrawerPluginProps {
  pages: {
    [pageKey: string]: Object;
  };
}

export default function Plugin({ pages }: NavDrawerPluginProps) {
  if (pages === undefined) {
    return null;
  }

  return (
    <>
      <PluginNavDrawer pages={pages} appKey={"test"} />
    </>
  );
}
