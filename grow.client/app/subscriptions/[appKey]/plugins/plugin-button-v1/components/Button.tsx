"use client";

import * as React from "react";

import { Button } from "@mui/material";
import useAppState from "../../../store/useAppState";

export default function PluginButton({
  label,
  clickAction,
  appStateKey,
  appStateValue,
}) {
  const useAppStateResults = useAppState(appStateKey?.value);

  function handleClick() {
    // console.log("PluginButton handleClick", clickAction);

    if (clickAction === "setAppState" && appStateValue?.value !== undefined) {
      Object.entries(useAppStateResults).forEach(
        ([key, useAppStateResult]: [string, any]) => {
          let newValue: any;

          if (appStateValue?.value === "toggle") {
            newValue = !useAppStateResult?.value;
          } else {
            newValue = appStateValue?.value;
          }

          // console.log(
          //   "PluginButton handleClick",
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
    <Button data-plugin="plugin-button-v1" onClick={handleClick}>
      {label}
    </Button>
  );
}
