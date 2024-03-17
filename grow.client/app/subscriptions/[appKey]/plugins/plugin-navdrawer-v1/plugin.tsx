"use client";

import { useEffect, useState } from "react";
import { Collection, getCollection } from "../../store/getCollection";
import PluginNavDrawer from "./components/NavDrawer";

export default function Plugin({ pages, ...props }) {

  if (pages === undefined) {
    return null;
  }

  return (
    <>
      <PluginNavDrawer pages={pages} appKey={"test"} />
    </>
  );
}