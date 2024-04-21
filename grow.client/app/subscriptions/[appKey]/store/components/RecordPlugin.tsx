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
  // console.log(
  //   "RecordPlugin useRecordsResults",
  //   useRecordsResults,
  //   recordFieldRequest
  // );

  if (useRecordsResults.collection !== undefined) {
    if (useRecordsResults.collection.value === undefined) {
      // console.log(
      //   "RecordPlugin useRecordsResults.collection.value is undefined"
      // );
      return null;
    }

    // console.log("RecordPlugin useRecordsResults has value", useRecordsResults);
    return (
      <ComponentsCollection components={useRecordsResults.collection.value} />
    );
  }

  const plugin = app.plugins[useRecordsResults.plugin_key.value?.key];
  // console.log("RecordPlugin plugin", useRecordsResults.plugin_key, plugin);

  if (!plugin) {
    return null;
  }

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

      const collection = app.getCollection(collectionKey);
      // const collection = app.collections[collectionKey];

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
  // console.log(
  //   "RecordPlugin RecordPluginComponent",
  //   plugin,
  //   record,
  //   useRecordsResults
  // );
  return (
    <RecordPluginComponent
      plugin={plugin}
      useRecordsResults={useRecordsResults}
    />
  );
}
