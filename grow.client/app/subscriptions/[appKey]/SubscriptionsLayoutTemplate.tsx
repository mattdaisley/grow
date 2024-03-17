"use client";

import { lazy } from "react";
import Box from "@mui/material/Box";

import { IApp, App } from "./store/getApp";

const plugins = {
  "plugin-appbar-v1": lazy(() => import(`./plugins/plugin-appbar-v1/plugin`)),
  "plugin-navdrawer-v1": lazy(
    () => import(`./plugins/plugin-navdrawer-v1/plugin`)
  )

};

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
  console.log("Rendering SubscriptionsLayoutTemplate");

  const currentApp = new App(app);

  return (
    <>
      <LayoutPlugins app={currentApp} />

      <Box
        component="main"
        sx={(theme) => {
          // // console.log(theme, theme.spacing(2))
          return {
            flexGrow: 1,
            pl: { xs: 0, md: `${drawerWidth}px` },
            // width: {sm: `calc(100% - ${drawerWidth}px)` },
            width: 1,
            height: "100%",
            position: "fixed",
            overflowY: "scroll",
          };
        }}
      >
        {children}
      </Box>
    </>
  );
}

const LayoutPlugins = ({app}) => {

  const layoutPlugins = Object.keys(app.plugins).filter(
    (key, index) => app.plugins[key].type === "layout"
  );

  const components = layoutPlugins.map((key) => {
    const plugin = app.plugins[key];

    const PluginComponent = plugins[plugin.name];

    if (PluginComponent === undefined) {
      console.log(`Plugin not found: `, plugin);
      return null;
    }

    function Component(props) {
      console.log("Rendering plugin: ", plugin.name);
      return <PluginComponent {...props} />;
    }

    return <Component key={key} {...plugin.properties} />;
  });

  return (
    <>
      {components}
    </>
  );

}