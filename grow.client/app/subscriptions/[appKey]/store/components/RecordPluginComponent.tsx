"use client";
import { lazy } from "react";

import { Plugin } from "../domain/Plugin";
import { Record } from "../domain/Record";

export const plugins = {
  "plugin-datagrid-v1": lazy(
    () => import(`../../plugins/plugin-datagrid-v1/plugin`)
  ),
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
    <>
      <style jsx>{`
        div.bounding-box {
          position: relative;
        }
        div.bounding-box:hover::after {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          border: solid 2px white;
        }
      `}</style>
      <div className={"bounding-box"}>
        <PluginComponent
          {...plugin.properties}
          {...(record?.value ?? {})}
          {...props}
        />
      </div>
    </>
  );
}
