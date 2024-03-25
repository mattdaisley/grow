"use client";

import useRecords from "../../../store/useRecords";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";
import { ListItem, ListItemText } from "@mui/material";

export function PluginListItem({ listItemRecord, ...props }) {
  console.log("PluginListItem", listItemRecord);

  const recordFieldRequest = {};

  Object.entries(props).forEach(([key, value]) => {
    recordFieldRequest[key] = {
      record: listItemRecord,
      field: value,
    };
  });

  const useRecordResults = useRecords(recordFieldRequest);
  console.log(
    "PluginListItem useRecordResults",
    useRecordResults,
    "recordFieldRequest",
    recordFieldRequest
  );

  if (
    !useRecordResults ||
    (Object.keys(useRecordResults).length === 0 &&
      Object.keys(recordFieldRequest).length > 0)
  ) {
    return null;
  }

  const primary = useRecordResults.primary?.value ?? props.primary;
  const secondary = useRecordResults.secondary?.value ?? props.secondary;

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
