"use client";

import { useContext, lazy } from "react";

import { SubscriptionStoreContext } from "../store/subscriptionStoreContext";

export const plugins = {
  "plugin-pages-v1": lazy(() => import(`../plugins/plugin-pages-v1/plugin`)),
};

export const PagePlugins = (props) => {
  const app = useContext(SubscriptionStoreContext);

  const pagePlugins = Object.keys(app.plugins).filter(
    (key, index) => app.plugins[key].parent === "page"
  );

  const sortedPagePlugins = pagePlugins.sort((a, b) => {
    return app.plugins[a].order - app.plugins[b].order;
  });

  const components = sortedPagePlugins.map((key) => {
    const plugin = app.plugins[key];

    const PluginComponent = plugins[plugin.name];

    if (PluginComponent === undefined) {
      console.log(`Plugin not found: `, plugin);
      return null;
    }

    function Component(props) {
      // console.log("Rendering plugin: ", plugin.name, plugin.properties);
      return <PluginComponent {...props} />;
    }

    return <Component key={key} {...plugin.properties} {...props} />;
  });

  return <>{components}</>;
};
