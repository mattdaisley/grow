"use client";

import { MouseEventHandler } from "react";
import { ListItem, ListItemButton, ListItemText, SxProps, Theme } from "@mui/material";

import useRecords from "../../../store/useRecords";
import useAppState from "../../../store/useAppState";
import { Record } from "../../../store/domain/Record";

export function PluginListItem({
  listItemRecord,
  appStateKey,
  appStateValue,
  button,
  onClick,
  clickAction,
  children,
  sx,
  ...props
}: {
  listItemRecord: Record;
  primary?: string;
  secondary?: string;
  button?: boolean;
  onClick?: (e: MouseEventHandler<HTMLDivElement>) => void;
  clickAction?: string;
  appStateValue?: string;
  appStateKey?: string;
  children?: any;
  sx?: SxProps<Theme>;
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
  let secondary = useRecordResults.secondary?.value ?? props.secondary;

  const primarySplit = primary?.split('/') || [''];

  return (
    <>
      {button && clickAction === "setAppState" ? (
        <PluginListItemButton
          useRecordResults={useRecordResults}
          appStateKey={appStateKey}
          onClick={onClick}
          sx={sx}
        >
          <ListItemText primary={primarySplit[primarySplit.length - 1]} secondary={secondary} />
          {/* <ListItemText primary={primary} secondary={secondary} /> */}
          {children}
        </PluginListItemButton>
      ) : (
        <ListItem>{children}</ListItem>
      )}

      {/* <PageHeader pageRecord={listItemRecord} />
      <ComponentsCollection components={components.value} /> */}
    </>
  );
}

function PluginListItemButton({ useRecordResults, appStateKey, onClick, children, sx }) {
  const useAppStateResults = useAppState(appStateKey);

  const handleButtonClick = () => {
    const appStateValue = `${useRecordResults.appStateValue?.value}`;
    // console.log("PluginListItemButton", selectedRecordKey);

    Object.entries(useAppStateResults).forEach(
      ([key, useAppStateResult]: [string, any]) => {
        useAppStateResult.onChange && useAppStateResult.onChange(appStateValue);
      }
    );

    onClick && onClick();
  };

  return (
    <ListItemButton sx={sx} onClick={handleButtonClick}>{children}</ListItemButton>
  );
}
