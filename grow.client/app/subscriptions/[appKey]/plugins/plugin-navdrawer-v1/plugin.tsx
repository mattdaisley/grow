"use client";

import { useContext, useEffect, useState } from "react";
import PluginNavDrawer from "./components/NavDrawer";
import { SubscriptionStoreContext } from "../../store/subscriptionStoreContext";

interface NavDrawerPluginProps {
  pages: {
    [pageKey: string]: Object;
  };
}

export default function Plugin({ pages }: NavDrawerPluginProps) {
  const app = useContext(SubscriptionStoreContext);

  if (pages === undefined) {
    return null;
  }

  return (
    <>
      <PluginNavDrawer pages={pages} appKey={app.key} />
    </>
  );
}
