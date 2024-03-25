"use client";

import useRecords from "../../../store/useRecords";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";
import { ListItem, ListItemText } from "@mui/material";

export function PluginListItem({ listItemRecord, ...props }) {
  console.log("PluginListItem", listItemRecord);

  // const recordFieldRequest = Object.entries(referencedFields).map(
  //   ([key, referencedField]) => {
  //     const record =
  //       collectionRecords[referencedField.collection.key].records[
  //         referencedField.recordKey
  //       ];
  //     return {
  //       record,
  //       field: record.schema.fields[referencedField.fieldKey].name,
  //     };
  //   }
  // );
  const recordFieldRequest = [];
  const propToFieldMap = {};

  Object.entries(props).forEach(([key, value]) => {
    if (typeof value === "string" && value.startsWith("schema.fields.")) {
      const field = value.split(".")[2];
      const fieldName = listItemRecord.schema.fields[field].name;
      recordFieldRequest.push({ record: listItemRecord, field: fieldName });
      propToFieldMap[key] = fieldName;
    }
  });

  const useRecordResults = useRecords(recordFieldRequest);
  console.log(
    "PluginListItem useRecordResults",
    useRecordResults,
    "recordFieldRequest",
    recordFieldRequest,
    "propToFieldMap",
    propToFieldMap
  );

  if (
    !useRecordResults ||
    (Object.keys(useRecordResults).length === 0 &&
      Object.keys(recordFieldRequest).length > 0)
  ) {
    return null;
  }

  const primary =
    useRecordResults[propToFieldMap["primary"]]?.value ?? props.primary;
  const secondary =
    useRecordResults[propToFieldMap["secondary"]]?.value ?? props.secondary;

  return (
    <>
      <ListItem>
        <ListItemText primary={primary} secondary={secondary} />
      </ListItem>
      {/* <PageHeader pageRecord={listItemRecord} />
      <ComponentsCollection components={components.value} /> */}
    </>
  );
}

function PageHeader({ pageRecord }) {
  const { display_name, path } = useRecords([
    { record: pageRecord, field: "display_name" },
    { record: pageRecord, field: "path" },
  ]);

  // console.log("PluginPage PageHeader", pageRecord, display_name, path);

  if (!display_name || !path) {
    return null;
  }

  return (
    <>
      <div>{display_name.value}</div>
      <div>{path.value}</div>
    </>
  );
}
