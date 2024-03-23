"use client";
import { lazy } from "react";

import { Plugin } from "../domain/Plugin";

export const plugins = {
  "plugin-textfield-v1": lazy(
    () => import(`../../plugins/plugin-textfield-v1/plugin`)
  ),
};

interface IRecordPluginComponentProps {
  plugin: Plugin;
  [props: string]: any;
}

export function RecordPluginComponent({
  plugin,
  ...props
}: IRecordPluginComponentProps) {
  console.log("RecordPlugin plugin", plugin);

  const PluginComponent = plugins[plugin.name];

  if (PluginComponent === undefined) {
    console.log(`Plugin not found: `, plugin);
    return null;
  }

  return <PluginComponent {...plugin.properties} {...props} />;
}
