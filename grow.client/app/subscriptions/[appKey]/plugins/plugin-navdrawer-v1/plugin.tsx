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
  const { drawerWidth } = useAppState("drawerWidth", false);

  useEffect(() => {
    // console.log("NavDrawerPlugin", drawerWidth);
    drawerWidth?.onChange && drawerWidth.onChange(200);
  }, [drawerWidth?.onChange]);

  if (pages === undefined) {
    return null;
  }

  return (
    <>
      <PluginNavDrawer pages={pages} appKey={app.key} />
    </>
  );
}
