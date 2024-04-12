"use client";

import useRecords from "../../../store/useRecords";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";
import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import useAppState from "../../../store/useAppState";
import { Record } from "../../../store/domain/Record";

export function PluginListItem({
  listItemRecord,
  ...props
}: {
  listItemRecord: Record;
  primary: string;
  secondary: string;
}) {
  // console.log("PluginListItem", listItemRecord);

  const recordFieldRequest = {};

  Object.entries(props).forEach(([key, value]) => {
    recordFieldRequest[key] = {
      record: listItemRecord,
      field: value,
    };
  });

  const useRecordResults = useRecords(recordFieldRequest);
  // console.log(
  //   "PluginListItem useRecordResults",
  //   useRecordResults,
  //   "recordFieldRequest",
  //   recordFieldRequest
  // );

  const { onChange: setSelectedRecord } = useAppState("selectedRecord");

  if (
    !useRecordResults ||
    (Object.keys(useRecordResults).length === 0 &&
      Object.keys(recordFieldRequest).length > 0)
  ) {
    return null;
  }

  let primary = useRecordResults.primary?.value;
  let secondary = useRecordResults.secondary?.value;

  if (primary === undefined) {
    primary = typeof props.primary === "string" ? props.primary : undefined;
  }

  if (secondary === undefined) {
    secondary =
      typeof props.secondary === "string" ? props.secondary : undefined;
  }
  // console.log(useRecordResults.secondary, props.secondary, secondary);

  const handleButtonClick = () => {
    const selectedRecordKey = `app.2.collections.${listItemRecord.key}`;
    setSelectedRecord(selectedRecordKey);
  };

  return (
    <>
      <ListItem>
        <ListItemButton dense onClick={handleButtonClick}>
          <ListItemText primary={primary} secondary={secondary} />
        </ListItemButton>
      </ListItem>
      {/* <PageHeader pageRecord={listItemRecord} />
      <ComponentsCollection components={components.value} /> */}
    </>
  );
}
