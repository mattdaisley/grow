"use client";

import { useContext } from "react";
import useRecords from "../useRecords";

import { RecordPluginComponent } from "./RecordPluginComponent";
import { ReferencedField } from "./ReferencedField";
import { SubscriptionStoreContext } from "../subscriptionStoreContext";
import { Record } from "../domain/Record";

interface IRecordPluginProps {
  record: Record;
}

export function RecordPlugin({ record }: IRecordPluginProps) {
  const app = useContext(SubscriptionStoreContext);
  console.log("RecordPlugin record", record);

  const recordFieldRequest = Object.entries(record.schema.fields).map(
    ([key, value]) => ({
      record,
      field: value.name,
    })
  );
  console.log("RecordPlugin recordFieldRequest", recordFieldRequest);
  const useRecordsResults = useRecords(recordFieldRequest);
  console.log("RecordPlugin useRecordsResults", useRecordsResults);

  if (
    !useRecordsResults ||
    Object.keys(useRecordsResults).length === 0 ||
    Object.values(useRecordsResults).filter(
      (recordValue) => recordValue === undefined
    ).length > 0
  ) {
    return null;
  }

  const pluginKey = useRecordsResults[`plugin_key`];
  const plugin = app.plugins[pluginKey?.value];
  console.log("RecordPlugin plugin.properties", plugin.properties);

  let referencedPlugin = undefined;
  const referencedFields = {};

  Object.entries(useRecordsResults).forEach(([key, useRecordsResult]) => {
    const value = useRecordsResult?.value;
    console.log("RecordPlugin useRecordsResult", key, useRecordsResult.value);

    if (key === "plugin_key") {
      referencedPlugin = console.log("RecordPlugin plugin_key", value);
    }

    if (typeof value === "string" && value.startsWith("collections.")) {
      const regex =
        /collections\.([a-zA-Z0-9-_]+)\.records\.([a-zA-Z0-9-_]+)\.([a-zA-Z0-9-_]+)/;
      const matches = useRecordsResult.value.match(regex);
      const collectionKey = matches[1];
      const recordKey = matches[2];
      const fieldKey = matches[3];

      const collection = app.collections[collectionKey];

      referencedFields[key] = {
        collection,
        recordKey,
        fieldKey,
        fieldPropKey: key,
      };
    }
  });

  if (Object.keys(referencedFields).length > 0) {
    console.log("RecordPlugin ReferencedField", referencedFields);
    return (
      <ReferencedField
        plugin={plugin}
        referencedFields={referencedFields}
        recordValues={useRecordsResults}
      />
    );
  }
  console.log("RecordPlugin RecordPluginComponent", plugin, record);
  return <RecordPluginComponent plugin={plugin} record={record} />;
}
