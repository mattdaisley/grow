"use client";

import { useContext, useEffect, useState } from "react";
import PluginAppBar from "./components/AppBar";
import { SubscriptionStoreContext } from "../../store/SubscriptionStoreContext";

export default function Plugin({ pages, ...props }) {
  const app = useContext(SubscriptionStoreContext);

  if (pages === undefined) {
    return null;
  }

  return (
    <>
      <PluginAppBar pages={pages} appKey={app.key} user={"test"} />
    </>
  );
}
