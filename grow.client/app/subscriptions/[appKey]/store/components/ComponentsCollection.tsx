"use client";

import { Record } from "../domain/Record";
import { ISchema } from "../domain/ISchema";
import useCollections from "../useCollections";
import useRecords from "../useRecords";
import { RecordPlugin } from "./RecordPlugin";

export function ComponentsCollection({ components }) {
  const collectionRecords = useCollections([components]);
  // console.log("ComponentsCollection", collectionRecords, components);
  // console.log(
  //   "ComponentsCollection",
  //   !collectionRecords,
  //   !collectionRecords[components.key]?.records
  // );
  if (!collectionRecords || !collectionRecords[components.key]?.records) {
    return null;
  }

  const componentRecords = collectionRecords[components.key].records;
  // console.log("ComponentsCollection componentRecords", componentRecords);

  const collection = collectionRecords[components.key];
  const hasSortOrder =
    Object.values(collection?.schema?.fields).filter(
      (x) => x.name === "sortOrder"
    ).length > 0;
  if (hasSortOrder) {
    // return null;
    return <SortedComponents collection={collection} />;
  }

  return (
    <>
      {Object.entries(componentRecords).map(([key, componentRecord]) => {
        return <RecordPlugin key={key} record={componentRecord} />;
      })}
    </>
  );
}

function SortedComponents({ collection }: { collection: {
  schema: ISchema;
  records: {
      [recordKey: string]: Record;
  };
}}) {
  const recordFieldRequest = {};

  Object.entries(collection.records).forEach(([key, record]) => {
    recordFieldRequest[key] = {
      record,
      field: "sortOrder",
    };
  });

  const useRecordsResults = useRecords(recordFieldRequest);
  // console.log(
  //   "ComponentsCollection recordFieldRequest",
  //   recordFieldRequest,
  //   useRecordsResults
  // );

  if (!useRecordsResults || Object.entries(useRecordsResults).filter(([key, record]) => record.value === undefined || record.record === undefined).length > 0) {
    return null;
  }

  const sortedRecords = Object.entries(useRecordsResults).sort(
    (a, b) => a[1].value - b[1].value
  );

  return (
    <>
      {sortedRecords.map(([key, useRecordsResult]) => {
        return <RecordPlugin key={key} record={useRecordsResult.record} />;
      })}
    </>
  );
}