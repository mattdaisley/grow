"use client";

import useRecords from "../../../store/useRecords";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";
import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import useAppState from "../../../store/useAppState";
import { Record } from "../../../store/domain/Record";

export function PluginListItem({
  listItemRecord,
  appStateKey,
  appStateValue,
  button,
  clickAction,
  ...props
}: {
  listItemRecord: Record;
  primary?: string;
  secondary?: string;
  button?: boolean;
  clickAction?: string;
  appStateValue?: string;
  appStateKey?: string;
}) {
  // console.log("PluginListItem", listItemRecord, props);

  const recordFieldRequest = {
    primary: {
      record: listItemRecord,
      field: props.primary,
    },
    secondary: {
      record: listItemRecord,
      field: props.secondary,
    },
    appStateValue: {
      record: listItemRecord,
      field: appStateValue,
    },
  };

  const useRecordResults = useRecords(recordFieldRequest);
  // console.log(
  //   "PluginListItem useRecordResults",
  //   useRecordResults,
  //   "recordFieldRequest",
  //   recordFieldRequest
  // );

  let primary = useRecordResults.primary.value;
  let secondary = useRecordResults.secondary?.value;

  const BoundingComponent =
    button && clickAction === "setAppState"
      ? PluginListItemButton
      : ({ children }) => <>{children}</>;

  return (
    <>
      <ListItem>
        <BoundingComponent
          useRecordResults={useRecordResults}
          appStateKey={appStateKey}
        >
          <ListItemText primary={primary} secondary={secondary} />
        </BoundingComponent>
      </ListItem>
      {/* <PageHeader pageRecord={listItemRecord} />
      <ComponentsCollection components={components.value} /> */}
    </>
  );
}

function PluginListItemButton({ useRecordResults, appStateKey, children }) {
  const useAppStateResults = useAppState(appStateKey);

  const handleButtonClick = () => {
    const selectedRecordKey = `app.2.collections.${useRecordResults.appStateValue?.value}`;
    // console.log("PluginListItemButton", selectedRecordKey);

    Object.entries(useAppStateResults).forEach(
      ([key, useAppStateResult]: [string, any]) => {
        useAppStateResult.onChange &&
          useAppStateResult.onChange(selectedRecordKey);
      }
    );
  };

  return (
    <ListItemButton dense onClick={handleButtonClick}>
      {children}
    </ListItemButton>
  );
}
