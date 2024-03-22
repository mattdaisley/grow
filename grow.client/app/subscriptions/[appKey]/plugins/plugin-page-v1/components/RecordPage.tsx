"use client";

import { lazy } from "react";

import Box from "@mui/material/Box";
import { Container, Paper } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import useRecord from "../../../store/useRecord";
import useCollection from "../../../store/useCollection";

const plugins = {
  "plugin-textfield-v1": lazy(() => import(`../../plugin-textfield-v1/plugin`)),
};

export function RecordPage({ page }) {
  const displayName = useRecord(page, "display_name");
  const path = useRecord(page, "path");
  const components = useRecord(page, "components");
  console.log(components);

  const components2 = useCollection(components);
  console.log(components2);
  return (
    <>
      <div>{displayName}</div>
      <div>{path}</div>
      {Object.entries(components2).map(([key, component]) => {
        return <RecordPlugin key={key} record={component} />;
      })}
    </>
  );
}

function RecordPlugin({ record }) {
  const pluginKey = useRecord(record, "plugin");
  const value = useRecord(record, "value");
  const label = useRecord(record, "label");
  console.log(
    "RecordPlugin pluginKey",
    pluginKey,
    "value",
    value,
    "label",
    label
  );

  const components = [pluginKey].map((key) => {
    const plugin = record._app.plugins[key];
    console.log("RecordPlugin plugin", plugin);

    const PluginComponent = plugins[plugin.name];

    if (PluginComponent === undefined) {
      console.log(`Plugin not found: `, plugin);
      return null;
    }

    function Component(props) {
      // console.log("Rendering plugin: ", plugin.name);
      return <PluginComponent {...props} />;
    }

    // const properties = []
    // Object.entries(plugin.properties).map(([key, value]) => {
    //   properties.push({ key, value });
    // });
    // console.log(plugin.properties);

    return (
      <Component key={key} {...plugin.properties} value={value} label={label} />
    );
  });

  return <>{components}</>;
}
