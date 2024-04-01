"use client";

import { useContext } from "react";
import useRecords from "../useRecords";

import { RecordPluginComponent } from "./RecordPluginComponent";
import { ReferencedField } from "./ReferencedField";
import { SubscriptionStoreContext } from "../SubscriptionStoreContext";
import { Record } from "../domain/Record";
import { ComponentsCollection } from "./ComponentsCollection";

interface IRecordPluginProps {
  record: Record;
}

export function RecordPlugin({ record }: IRecordPluginProps) {
  const app = useContext(SubscriptionStoreContext);
  // console.log("RecordPlugin record", record);

  const recordFieldRequest = {};
  Object.entries(record.schema.fields).forEach(([key, value]) => {
    recordFieldRequest[value.name] = {
      record,
    };
  });
  // console.log("RecordPlugin recordFieldRequest", recordFieldRequest);
  const useRecordsResults = useRecords(recordFieldRequest);

  if (
    !useRecordsResults ||
    Object.keys(useRecordsResults).length === 0 ||
    Object.values(useRecordsResults).filter(
      (recordValue) => recordValue === undefined
    ).length > 0
  ) {
    return null;
  }
  // console.log("RecordPlugin useRecordsResults", useRecordsResults);

  if (useRecordsResults.collection !== undefined) {
    return (
      <ComponentsCollection components={useRecordsResults.collection.value} />
    );
  }

  const pluginKey = useRecordsResults[`plugin_key`];
  const plugin = app.plugins[pluginKey?.value];
  // console.log("RecordPlugin plugin", pluginKey, plugin);

  const referencedFields = {};

  Object.entries(useRecordsResults).forEach(([key, useRecordsResult]) => {
    const value = useRecordsResult?.value;
    // console.log("RecordPlugin useRecordsResult", key, useRecordsResult.value);

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
    // console.log("RecordPlugin ReferencedField", referencedFields);
    return (
      <ReferencedField
        plugin={plugin}
        referencedFields={referencedFields}
        recordValues={useRecordsResults}
      />
    );
  }
  // console.log("RecordPlugin RecordPluginComponent", plugin, record);
  return <RecordPluginComponent plugin={plugin} record={record} />;
}
