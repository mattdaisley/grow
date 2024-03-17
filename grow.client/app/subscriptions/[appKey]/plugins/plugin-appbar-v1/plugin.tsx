"use client";

import { useEffect, useState } from "react";
import PluginAppBar from "./components/AppBar";

export default function Plugin({ pages, ...props }) {
  if (pages === undefined) {
    return null;
  }

  return (
    <>
      <PluginAppBar pages={pages} user={"test"} />
    </>
  );
}
