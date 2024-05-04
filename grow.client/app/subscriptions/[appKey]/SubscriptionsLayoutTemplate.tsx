"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
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

  const [currentApp, setApp] = useState<App>(undefined);

  // const currentApp = useMemo(() => new App(app), [app.key]);

  useEffect(() => {
    if (!currentApp) {
      socket.emit("get-app", { appKey });
      socket.on(`app-${appKey}`, (data) => {
        // console.log("app", data);

        setApp(new App(data, socket));
      });
    }

    return () => {
      if (!!currentApp) {
        socket.off(`app-${appKey}`);
        currentApp?.unregisterMessageListeners();
      }
    };
  }, [appKey, currentApp?.key]);

  // useEffect(() => {
  //   console.log("registering subscriptions");
  //   setReady(true);

  //   return () => {
  //     console.log("unregistering subscriptions");
  //     socket.off("subscriptions");
  //   };
  // }, [currentApp]);

  const scrollableRef = useRef(null);

  useEffect(() => {
    if (!scrollableRef?.current) return;

    const handleScroll = (e) => {
      console.log(
        "Scrolled inside SubscriptionsLayoutTemplate",
        e.target.scrollTop,
        e.target.scrollHeight,
        e.target.clientHeight
      );
    };

    scrollableRef.current.addEventListener("scroll", handleScroll);

    return () => {
      scrollableRef.current.removeEventListener("scroll", handleScroll);
    };
  }, [scrollableRef?.current]);

  if (!currentApp) {
    return null;
  }

  return (
    <>
      <SocketContext.Provider value={socket}>
        <SubscriptionStoreContext.Provider value={currentApp}>
          <MouseWatcher currentApp={currentApp} />
          <Box sx={{ height: "100%", overflowY: "auto" }} ref={scrollableRef}>
            <LayoutPlugins />

            {children}
          </Box>
        </SubscriptionStoreContext.Provider>
      </SocketContext.Provider>
    </>
  );
}

function MouseWatcher({ currentApp }: { currentApp: App }) {
  const socket = useContext(SocketContext);

  const [mousePosition, setMousePosition] = useState({ x: -20, y: -20 });
  const [otherMousePositions, setOtherMousePositions] = useState({});

  const emitPosition = (x, y) => {
    // console.log(
    //   "emit mouse-moved",
    //   socket.id,
    //   currentApp.getAppInstance(),
    //   x,
    //   y
    // );
    socket.emit(`mouse-moved`, {
      clientId: socket.id,
      instance: currentApp.getAppInstance(),
      appKey: currentApp.key,
      x,
      y,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });
  };

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    // console.log("emit mouse-moved", e, e.clientX, e.clientY, window.parent);

    emitPosition(e.clientX, e.clientY);

    if (window.self !== window.top) {
      window.parent.postMessage("Mouse moved inside iframe", "*");
    }

    // if (window.self !== window.top) {
    //   window.parent.postMessage("Mouse moved inside iframe", "*");
    //   socket.emit("mouse-moved", { appKey, x: -20, y: -20 });
    // } else {
    //   socket.emit(`mouse-moved`, {
    //     appKey,
    //     x: e.clientX + 5,
    //     y: e.clientY + 5,
    //   });
    // }
  };

  const handleMouseOut = (e) => {
    if (!e.relatedTarget && !e.toElement) {
      setMousePosition({ x: -20, y: -20 });
      emitPosition(-20, -20);
      // console.log("Mouse left document");
    }
  };

  const handleMouseMoveInsideIframe = (e) => {
    if (e.data !== "Mouse moved inside iframe") {
      return;
    }

    // console.log("Mouse moved inside iframe", e.data);
    setMousePosition({ x: -20, y: -20 });
    emitPosition(-20, -20);
  };

  const handleMouseMoveEvent = (data) => {
    if (data.clientId === socket.id) {
      return;
    }
    // console.log("mouse-moved", data, socket.id, currentApp.getAppInstance());

    const windowWidth = data.windowWidth
      ? parseInt(data.windowWidth)
      : undefined;
    const windowHeight = data.windowHeight
      ? parseInt(data.windowHeight)
      : undefined;
    let x = parseInt(data.x);
    let y = parseInt(data.y);

    // scale x to current window width relative to other client's window width
    if (windowWidth) {
      // left nav drawer has width of 200
      if (x > 200) {
        x = ((x - 200) / (windowWidth - 200)) * (window.innerWidth - 200) + 200;
      }
    }

    // scale y to current window height relative to other client's window height
    // if (windowHeight) {
    //   y = (y / windowHeight) * window.innerHeight;
    // }

    // console.log("handle mouse-moved event", data, {
    //   x,
    //   y,
    //   instance: currentApp.getAppInstance(),
    // });

    const client = otherMousePositions[data.clientId] ?? {};
    if (!client.color) {
      client.color = Math.floor(Math.random() * 16777215).toString(16);
    }
    client.x = x;
    client.y = y;

    setOtherMousePositions({
      ...otherMousePositions,
      [data.clientId]: { ...client },
    });
  };

  const handleClientDisconnectEvent = (data) => {
    console.log("socket disconnected", data, Object.keys(otherMousePositions));

    const newState = { ...otherMousePositions };
    delete newState[data.clientId];
    setOtherMousePositions(newState);
  };

  useEffect(() => {
    console.log();
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("message", handleMouseMoveInsideIframe);

    socket.on(`mouse-moved-${currentApp.key}`, handleMouseMoveEvent);
    socket.on(`client-disconnect`, handleClientDisconnectEvent);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("message", handleMouseMoveInsideIframe);
      socket.off(`mouse-moved-${currentApp.key}`, handleMouseMoveEvent);
      socket.off("client-disconnect", handleClientDisconnectEvent);
    };
  }, [
    otherMousePositions,
    emitPosition,
    setOtherMousePositions,
    handleMouseMove,
    handleMouseOut,
    handleMouseMoveInsideIframe,
    handleMouseMoveEvent,
    handleClientDisconnectEvent,
    currentApp.key,
  ]);

  return (
    <>
      {/* <div
        style={{
          position: "absolute",
          left: mousePosition.x - 5,
          top: mousePosition.y - 5,
          width: 20,
          height: 20,
          backgroundColor: "green",
          borderRadius: 10,
          zIndex: 10000,
          pointerEvents: "none",
        }}
      ></div> */}

      {Object.keys(otherMousePositions).map((key) => {
        const position = otherMousePositions[key];
        return (
          <div
            key={key}
            style={{
              position: "absolute",
              left: position.x - 5,
              top: position.y - 5,
              width: 20,
              height: 20,
              backgroundColor: `#${position.color}`,
              borderRadius: 10,
              zIndex: 10000,
              pointerEvents: "none",
            }}
          ></div>
        );
      })}
    </>
  );
}
