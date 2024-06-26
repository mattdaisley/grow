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
  //   recordFieldRequest,
  //   useRecordResults.appStateValue.value
  // );

  let primary = useRecordResults.primary.value;
  let secondary = useRecordResults.secondary?.value ?? props.secondary;

  const primarySplit = primary?.split("/") || [""];

  if (button && clickAction === "setAppState") {
    return (
      <PluginListItemButton
        listItemRecord={listItemRecord}
        useRecordResults={useRecordResults}
        appStateKey={appStateKey}
        onClick={onClick}
        sx={sx}
      >
        <ListItemText
          primary={primarySplit[primarySplit.length - 1]}
          secondary={secondary}
        />
        {/* <ListItemText primary={primary} secondary={secondary} /> */}
        {children}
      </PluginListItemButton>
    );
  }

  if (primary !== undefined) {
    return (
      <ListItem>
        <ListItemText primary={primary} secondary={secondary} />
      </ListItem>
    );
  }

  return (
    <>
      <ListItem>{children}</ListItem>
    </>
  );
}

function PluginListItemButton({ listItemRecord, useRecordResults, appStateKey, onClick, children, sx }) {
  const useAppStateResults = useAppState(appStateKey);
  // console.log("PluginListItemButton", listItemRecord, useRecordResults, useAppStateResults);

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

  const itemSelected =
    listItemRecord.key === useAppStateResults.selectedRecord?.value;

  return (
    <ListItemButton selected={itemSelected} sx={sx} onClick={handleButtonClick}>
      {children}
    </ListItemButton>
  );
}
