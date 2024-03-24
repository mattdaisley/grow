"use client";

import { useContext } from "react";
import useRecords from "../useRecords";

import { RecordPluginComponent } from "./RecordPluginComponent";
import { ReferencedField } from "./ReferencedField";
import { SubscriptionStoreContext } from "../subscriptionStoreContext";
import { Record } from "../domain/Record";

export function RecordPlugin({ record }: { record: Record }) {
  const app = useContext(SubscriptionStoreContext);

  const recordFieldRequest = Object.entries(record.schema.fields).map(
    ([key, value]) => ({
      record,
      field: value.name,
    })
  );
  // console.log(recordFieldRequest);
  const useRecordsResults = useRecords(recordFieldRequest);
  // console.log("RecordPlugin recordValues", useRecordsResults);

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
  // console.log(plugin.properties);

  const referencedFields = {};

  Object.entries(useRecordsResults).forEach(([key, useRecordsResult]) => {
    const value = useRecordsResult?.value;
    if (typeof value === "string" && value.startsWith("collections.")) {
      // console.log("RecordPlugin useRecordsResult", key, useRecordsResult.value);

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
    return (
      <ReferencedField
        plugin={plugin}
        referencedFields={referencedFields}
        recordValues={useRecordsResults}
      />
    );
  }

  return <RecordPluginComponent plugin={plugin} record={record} />;
}
