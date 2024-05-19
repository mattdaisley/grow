"use client";

import * as React from "react";

import { Button, ButtonGroup } from "@mui/material";
import useAppState from "../../../store/useAppState";
import { Collection } from "../../../store/domain/Collection";
import useCollections from "../../../store/useCollections";
import useRecords from "../../../store/useRecords";

interface IPluginButtonGroup {
  buttonsCollection: Collection;
  label?: string;
  clickAction?: string;

  // if clickAction === "setAppState"
  appStateKey?: string;
  appStateValue?: string;
}

export default function PluginButtonGroup({
  buttonsCollection,
  clickAction,
  appStateKey,
  appStateValue,
  ...props
}: IPluginButtonGroup) {
  // console.log(
  //   "PluginButtonGroup",
  //   buttonsCollection,
  //   clickAction,
  //   appStateKey,
  //   appStateValue
  // );

  const useAppStateResults = useAppState(appStateKey);

  const buttonsCollectionResponse = useCollections([buttonsCollection]);
  // console.log("PluginButtonGroup buttonsCollectionResponse", buttonsCollectionResponse);
  if (
    !buttonsCollectionResponse ||
    !buttonsCollectionResponse[buttonsCollection.key]?.records
  ) {
    return null;
  }

  const buttonsRecords =
    buttonsCollectionResponse[buttonsCollection.key].records;

  function handleClick(buttonKey) {
    // console.log(
    //   "PluginButtonGroup handleClick",
    //   clickAction,
    //   appStateValue,
    //   useAppStateResults
    // );

    if (clickAction === "setAppState" && appStateValue !== undefined) {
      Object.entries(useAppStateResults).forEach(
        ([key, useAppStateResult]: [string, any]) => {
          let newValue: any;

          if (appStateValue === "key") {
            newValue = buttonKey;
          } else {
            newValue = appStateValue;
          }

          // console.log(
          //   "PluginButtonGroup handleClick",
          //   clickAction,
          //   appStateKey,
          //   newValue
          // );
          useAppStateResult.onChange && useAppStateResult.onChange(newValue);
        }
      );
    }
  }

  return (
    <>
      <ButtonGroup data-plugin="plugin-button-group-v1">
        {Object.entries(buttonsRecords).map(([key, buttonRecord]) => {
          return (
            <ButtonGroupButton
              key={key}
              buttonRecord={buttonRecord}
              onClick={() => handleClick(key)}
              {...props}
            />
          );
        })}
      </ButtonGroup>
    </>
  );
}

function ButtonGroupButton({ buttonRecord, onClick, ...props }) {
  const recordFieldRequest = {
    label: {
      record: buttonRecord,
      field: props.label,
    }
  };

  const useRecordResults = useRecords(recordFieldRequest);
  // console.log(
  //   "ButtonGroupButton useRecordResults",
  //   useRecordResults,
  //   "recordFieldRequest",
  //   recordFieldRequest
  // );

  let label = useRecordResults.label.value;

  return <Button onClick={onClick}>{label}</Button>;
}