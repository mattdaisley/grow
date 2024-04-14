"use client";

import { useContext } from "react";

import PluginDrawer from "./components/PluginDrawer";
import { SubscriptionStoreContext } from "../../store/SubscriptionStoreContext";

export default function Plugin({ components, ...props }) {
  // console.log("plugin-drawer-v1", components);
  const app = useContext(SubscriptionStoreContext);

  if (components === undefined) {
    return null;
  }

  const propValues = {};
  Object.entries(props).forEach(([key, value]) => {
    propValues[key] = value.value;
  });

  return (
    <>
      <PluginDrawer components={components.value} {...propValues} />
    </>
  );
}
