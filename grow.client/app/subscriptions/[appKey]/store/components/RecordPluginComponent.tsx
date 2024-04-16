"use client";
import { lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { Plugin } from "../domain/Plugin";
import { useRecordsResult } from "../useRecords";

export const plugins = {
  "plugin-container-v1": lazy(
    () => import(`../../plugins/plugin-container-v1/plugin`)
  ),
  "plugin-datagrid-v1": lazy(
    () => import(`../../plugins/plugin-datagrid-v1/plugin`)
  ),
  "plugin-drawer-v1": lazy(
    () => import(`../../plugins/plugin-drawer-v1/plugin`)
  ),
  "plugin-iframe-v1": lazy(
    () => import(`../../plugins/plugin-iframe-v1/plugin`)
  ),
  "plugin-list-v1": lazy(() => import(`../../plugins/plugin-list-v1/plugin`)),
  "plugin-textfield-v1": lazy(
    () => import(`../../plugins/plugin-textfield-v1/plugin`)
  ),
  "plugin-select-v1": lazy(
    () => import(`../../plugins/plugin-select-v1/plugin`)
  ),
};

interface IRecordPluginComponentProps {
  plugin: Plugin;
  useRecordsResults: useRecordsResult;
}

export function RecordPluginComponent({
  plugin,
  useRecordsResults,
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
    <ErrorBoundary
      FallbackComponent={ErrorComponent}
      onError={(error, errorInfo) => {
        // log the error
        console.log("Error caught!");
        console.error(error);
        console.error(errorInfo);

        // record the error in an APM tool...
      }}
    >
      <PluginComponent
        {...plugin.properties}
        {...useRecordsResults}
        // {...(record?.value ?? {})}
        {...props}
      />
    </ErrorBoundary>
  );
}

function ErrorComponent() {
  return <div>Error</div>;
}
