"use client";
import useRecords from "../useRecords";
import useCollections from "../useCollections";
import { Collection } from "../domain/Collection";
import { Plugin } from "../domain/Plugin";
import { RecordPluginComponent } from "./RecordPluginComponent";

interface IReferencedFieldProps {
  plugin: Plugin;
  referencedFields: {
    [key: string]: {
      collection: Collection;
      recordKey: string;
      fieldKey: string;
      fieldPropKey: string;
    };
  };
  recordValues;
}
export function ReferencedField({
  plugin,
  referencedFields,
  recordValues,
  ...props
}: IReferencedFieldProps) {
  // console.log(
  //   "ReferencedField referencedFields",
  //   referencedFields,
  //   "recordValues",
  //   recordValues
  // );
  const collectionRecords = useCollections(
    Object.entries(referencedFields).map(([key, value]) => value.collection)
  );

  // console.log("ReferencedField collectionRecords", collectionRecords);
  if (
    !collectionRecords ||
    Object.keys(collectionRecords).length === 0 ||
    Object.values(collectionRecords).filter((records) => records === undefined)
      .length > 0
  ) {
    return null;
  }

  // return <></>;
  return (
    <ReferencedField2
      plugin={plugin}
      collectionRecords={collectionRecords}
      referencedFields={referencedFields}
      recordValues={recordValues}
    />
  );
}

interface IReferencedField2Props {
  plugin: Plugin;
  collectionRecords: {
    [key: string]: {
      records: {
        [key: string]: any;
      };
    };
  };
  referencedFields: {
    [key: string]: {
      collection: Collection;
      recordKey: string;
      fieldKey: string;
      fieldPropKey: string;
    };
  };
  recordValues;
}
function ReferencedField2({
  plugin,
  collectionRecords,
  referencedFields,
  recordValues,
}: IReferencedField2Props) {
  const recordFieldRequest = {};
  Object.entries(referencedFields).map(([key, referencedField]) => {
    const record =
      collectionRecords[referencedField.collection.key].records[
        referencedField.recordKey
      ];
    const field = record.schema.fields[referencedField.fieldKey]?.name;
    recordFieldRequest[field] = {
      record,
    };
  });

  const useRecordsResults = useRecords(recordFieldRequest);
  if (
    !useRecordsResults ||
    Object.keys(useRecordsResults).length === 0 ||
    Object.values(useRecordsResults).filter(
      (useRecordsResult) => useRecordsResult === undefined
    ).length > 0
  ) {
    return null;
  }

  // console.log(
  //   "ReferencedField2 referencedFields",
  //   referencedFields,
  //   "useRecordsResults",
  //   useRecordsResults,
  //   "recordValues",
  //   recordValues
  // );

  const lookedUpValues = {};

  Object.entries(referencedFields).forEach(([key, referencedField]) => {
    const record =
      collectionRecords[referencedField.collection.key].records[
        referencedField.recordKey
      ];
    const useRecordKey = record.schema.fields[referencedField.fieldKey]?.name;

    lookedUpValues[key] = useRecordsResults[useRecordKey];
  });

  // console.log(
  //   "ReferencedField2 useRecordsResults",
  //   useRecordsResults,
  //   "referencedFields",
  //   referencedFields,
  //   "recordValues",
  //   recordValues
  // );

  return (
    <>
      <RecordPluginComponent
        plugin={plugin}
        {...recordValues}
        {...lookedUpValues}
      />
    </>
  );
}
