"use client";

import { useContext, lazy } from "react";

import { SubscriptionStoreContext } from "./store/subscriptionStoreContext";

export const plugins = {
  "plugin-appbar-v1": lazy(() => import(`./plugins/plugin-appbar-v1/plugin`)),
  "plugin-navdrawer-v1": lazy(
    () => import(`./plugins/plugin-navdrawer-v1/plugin`)
  ),
};

export const LayoutPlugins = (props) => {
  const app = useContext(SubscriptionStoreContext);

  const layoutPlugins = Object.keys(app.plugins).filter(
    (key, index) => app.plugins[key].parent === "layout"
  );

  const sortedLayoutPlugins = layoutPlugins.sort((a, b) => {
    return app.plugins[a].order - app.plugins[b].order;
  });

  const components = sortedLayoutPlugins.map((key) => {
    const plugin = app.plugins[key];

    const PluginComponent = plugins[plugin.name];

    if (PluginComponent === undefined) {
      console.log(`Plugin not found: `, plugin);
      return null;
    }

    function Component(props) {
      // console.log("Rendering plugin: ", plugin.name);
      return <PluginComponent {...props} />;
    }

    return <Component key={key} {...plugin.properties} />;
  });

  return <>{components}</>;
};
