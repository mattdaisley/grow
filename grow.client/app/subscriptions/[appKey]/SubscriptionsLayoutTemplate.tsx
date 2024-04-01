"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";

import { SocketContext, socket } from "./store/SocketContext";
import { SubscriptionStoreContext } from "./store/SubscriptionStoreContext";
import { IApp, App } from "./store/domain/App";
import { LayoutPlugins } from "./LayoutPlugins";

const drawerWidth = 200;

interface Props {
  appKey: string;
  children: React.ReactNode;
}

export default function SubscriptionsLayoutTemplate({
  appKey,
  children,
  ...props
}: Props) {
  // console.log("Rendering SubscriptionsLayoutTemplate");

  const [currentApp, setApp] = useState<App>(null);

  // const currentApp = useMemo(() => new App(app), [app.key]);

  useEffect(() => {
    socket.emit("get-app", { appKey });
    socket.on(`app-${appKey}`, (data) => {
      // console.log("app", data);

      setApp(new App(data));
    });

    return () => {
      socket.off(`app-${appKey}`);
    };
  }, [appKey]);

  useEffect(() => {
    socket.on("subscriptions", (data) => {
      // console.log("subscriptions", data);
      currentApp?.handleEvent(data);
    });

    return () => {
      socket.off("subscriptions");
    };
  }, [currentApp]);

  if (!currentApp) {
    return null;
  }

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
