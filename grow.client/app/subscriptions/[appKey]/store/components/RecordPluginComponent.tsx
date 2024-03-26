"use client";
import { lazy } from "react";

import { Plugin } from "../domain/Plugin";
import { Record } from "../domain/Record";

export const plugins = {
  "plugin-list-v1": lazy(() => import(`../../plugins/plugin-list-v1/plugin`)),
  "plugin-textfield-v1": lazy(
    () => import(`../../plugins/plugin-textfield-v1/plugin`)
  ),
};

interface IRecordPluginComponentProps {
  plugin: Plugin;
  record: Record;
}

export function RecordPluginComponent({
  plugin,
  record,
  ...props
}: IRecordPluginComponentProps) {
  // console.log(
  //   "RecordPluginComponent plugin",
  //   plugin,
  //   "record",
  //   record,
  //   "props",
  //   props
  // );

  const PluginComponent = plugins[plugin.name];

  if (PluginComponent === undefined) {
    console.log(`Plugin not found: `, plugin);
    return null;
  }

  return (
    <PluginComponent
      {...plugin.properties}
      {...(record?.value ?? {})}
      {...props}
    />
  );
}
