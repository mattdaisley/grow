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
  const [otherMousePosition, setOtherMousePosition] = useState({
    x: -20,
    y: -20,
  });

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    // console.log("emit mouse-moved", e, e.clientX, e.clientY, window.parent);
    socket.emit(`mouse-moved`, {
      appKey: currentApp.key,
      instance: currentApp.getAppInstance(),
      x: e.clientX,
      y: e.clientY,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });

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
      socket.emit("mouse-moved", {
        appKey: currentApp.key,
        instance: currentApp.getAppInstance(),
        x: -20,
        y: -20,
      });
      // console.log("Mouse left document");
    }
  };

  const handleMouseMoveInsideIframe = (e) => {
    if (e.data !== "Mouse moved inside iframe") {
      return;
    }

    // console.log("Mouse moved inside iframe", e.data);
    setMousePosition({ x: -20, y: -20 });
    socket.emit("mouse-moved", {
      appKey: currentApp.key,
      instance: currentApp.getAppInstance(),
      x: -20,
      y: -20,
    });
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("message", handleMouseMoveInsideIframe);

    socket.on(`mouse-moved-${currentApp.key}`, (data) => {
      if (data.instance === currentApp.getAppInstance()) {
        return;
      }

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
          x =
            ((x - 200) / (windowWidth - 200)) * (window.innerWidth - 200) + 200;
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
      setOtherMousePosition({ x, y });
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("message", handleMouseMoveInsideIframe);
      socket.off(`mouse-moved`);
    };
  }, []);

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

      <div
        style={{
          position: "absolute",
          left: otherMousePosition.x - 5,
          top: otherMousePosition.y - 5,
          width: 20,
          height: 20,
          backgroundColor: "red",
          borderRadius: 10,
          zIndex: 10000,
          pointerEvents: "none",
        }}
      ></div>
    </>
  );
}
