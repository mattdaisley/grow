"use client";

import { useContext } from "react";

import PluginDrawer from "./components/PluginDrawer";
import { SubscriptionStoreContext } from "../../store/SubscriptionStoreContext";

interface DrawerPluginProps {
  components: {
    [pageKey: string]: Object;
  };
  variant?: string;
  anchor?: string;
}

export default function Plugin({
  components,
  variant,
  anchor,
}: DrawerPluginProps) {
  // console.log("plugin-drawer-v1", components);
  const app = useContext(SubscriptionStoreContext);

  if (components === undefined) {
    return null;
  }

  return (
    <>
      <PluginDrawer
        anchor={anchor}
        components={components}
        variant={variant}
        appKey={app.key}
      />
    </>
  );
}
