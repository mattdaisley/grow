"use client";

import { lazy } from "react";

const plugins = {
  "plugin-pages-v1": lazy(() => import(`./plugins/plugin-pages-v1/plugin`)),
};


export default function SubscriptionsLayoutTemplate({
  app,
  children,
  ...props
}) {
  const builtInPlugins = Object.keys(app.plugins).filter(
    (key, index) => app.plugins[key].source === "built-in"
  );

  return (
    <div>
      {
        builtInPlugins.map((key) => {
        
          const Component = plugins[app.plugins[key].name]

          if (Component === undefined) {
            console.log(`Plugin not found: ${app.plugins[key].name}`);
            return null;
          }

          return (
            <Component app={app} key={key} pluginKey={key} {...props} />
          );
        })
      }

      {children}
    </div>
  );
}
