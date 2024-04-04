"use client";

import { useContext, useEffect } from "react";

import PluginNavDrawer from "./components/NavDrawer";
import { SubscriptionStoreContext } from "../../store/SubscriptionStoreContext";
import useAppState from "../../store/useAppState";

interface NavDrawerPluginProps {
  pages: {
    [pageKey: string]: Object;
  };
}

export default function Plugin({ pages }: NavDrawerPluginProps) {
  const app = useContext(SubscriptionStoreContext);
  const { onChange: setDrawerWidth } = useAppState("drawerWidth");

  useEffect(() => {
    setDrawerWidth && setDrawerWidth(200);
  }, [setDrawerWidth]);

  if (pages === undefined) {
    return null;
  }

  return (
    <>
      <PluginNavDrawer pages={pages} appKey={app.key} />
    </>
  );
}
