"use client";

import { lazy } from "react";
import Box from "@mui/material/Box";

const plugins = {
  "plugin-pages-v1": lazy(() => import(`./plugins/plugin-pages-v1/plugin`)),
};

const drawerWidth = 200;


export default function SubscriptionsLayoutTemplate({
  app,
  children,
  ...props
}) {
  const layoutPlugins = Object.keys(app.plugins).filter(
    (key, index) => app.plugins[key].type === "layout"
  );

  return (
    <div>
      {layoutPlugins.map((key) => {
        const Component = plugins[app.plugins[key].name];

        if (Component === undefined) {
          console.log(`Plugin not found: ${app.plugins[key].name}`);
          return null;
        }

        return <Component app={app} key={key} pluginKey={key} {...props} />;
      })}

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
    </div>
  );
}
