"use client";

import { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";

import { SocketContext, socket } from "../../SocketContext";
import { SubscriptionStoreContext } from "./store/subscriptionStoreContext";
import { IApp, App } from "./store/domain/App";
import { LayoutPlugins } from "./LayoutPlugins";

const drawerWidth = 200;

interface Props {
  app: IApp;
  children: React.ReactNode;
}

export default function SubscriptionsLayoutTemplate({
  app,
  children,
  ...props
}: Props) {
  // console.log("Rendering SubscriptionsLayoutTemplate");

  const currentApp = useMemo(() => new App(app), [app.key]);

  useEffect(() => {
    socket.on("subscriptions", (data) => {
      currentApp.handleEvent(data);
    });

    return () => {
      socket.off("subscriptions");
    };
  }, []);

  return (
    <>
      <SocketContext.Provider value={socket}>
        <SubscriptionStoreContext.Provider value={currentApp}>
          <LayoutPlugins />

          {children}
        </SubscriptionStoreContext.Provider>
      </SocketContext.Provider>
    </>
  );
}
