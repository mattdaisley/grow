"use client";

import { useContext, useEffect, useState } from "react";
import PluginAppBar from "./components/AppBar";
import { SubscriptionStoreContext } from "../../store/SubscriptionStoreContext";
import useAppState from "../../store/useAppState";

export default function Plugin({ pages, ...props }) {
  const app = useContext(SubscriptionStoreContext);
  const { onChange: setAppBarHeight } = useAppState("appBarHeight");

  useEffect(() => {
    setAppBarHeight && setAppBarHeight(200);
  }, [setAppBarHeight]);

  if (pages === undefined) {
    return null;
  }

  return (
    <>
      <PluginAppBar pages={pages} appKey={app.key} user={"test"} />
    </>
  );
}
