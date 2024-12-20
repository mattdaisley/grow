"use client";

import * as React from "react";

import { Button } from "@mui/material";
import useAppState from "../../../store/useAppState";
import { App } from "../../../store/domain/App";
import { Collection } from "../../../store/domain/Collection";

type TargetRecord = {
  target_field: string;
  target_value: string;
};

interface IPluginButton {
  label: string;
  clickAction?: string;

  // if clickAction === "setAppState"
  appStateKey?: string;
  appStateValue?: string;

  // if clickAction === "addCollection"
  app?: App;
  collection_display_name?: string;
  collection_name?: string;

  // if clickAction === "copyCollection"
  // collection_display_name?: string; -- shared with addCollection
  // collection_name?: string; -- shared with addCollection
  source_collection?: string | Collection<any>; // -- shared with copyRow
  source_app?: App;
  target_app?: App;

  // if clickAction === "addColumn"
  components?: Collection;
  column_name?: string;
  column_type?: string;

  // if clickAction === "addRow"
  // components?: Collection; -- shared with addColumn

  // if clickAction === "copyRow"
  source_record?: string;
  // components?: Collection; -- shared with addColumn
  // source_collection?: string; -- shared with copyCollection
}

export default function PluginButton({
  label,
  clickAction,
  appStateKey,
  appStateValue,
  app,
  collection_display_name,
  collection_name,
  components,
  column_name,
  column_type,
  source_app,
  source_collection,
  source_record,
  target_app,
}: IPluginButton) {
  // console.log(
  //   "PluginButton",
  //   label,
  //   clickAction,
  //   appStateKey,
  //   appStateValue,
  //   components,
  //   column_name,
  //   column_type
  // );
  const useAppStateResults = useAppState(appStateKey);

  function handleClick() {
    // console.log("PluginButton handleClick", clickAction, components);

    if (clickAction === "setAppState" && appStateValue !== undefined) {
      Object.entries(useAppStateResults).forEach(
        ([key, useAppStateResult]: [string, any]) => {
          let newValue: any;

          if (appStateValue === "toggle") {
            newValue = !useAppStateResult?.value;
          } else {
            newValue = appStateValue;
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

    if (
      clickAction === "addCollection" &&
      app !== undefined &&
      app.key !== ""
    ) {
      // {{a.1.c.59.r.134.ca90b5f1-a487-4f31-bcdb-35127c725f13}}
      // {{a.1.c.59.r.135.ca90b5f1-a487-4f31-bcdb-35127c725f13}}

      if (
        collection_display_name !== undefined &&
        collection_display_name.trim() !== "" &&
        collection_name !== undefined &&
        collection_name.trim() !== ""
      ) {
        // console.log(
        //   "button clickAction addCollection",
        //   app,
        //   collection_display_name,
        //   collection_name
        // );

        const newCollection = {
          displayName: collection_display_name,
          name: collection_name,
        };

        app.pushCreateCollection(newCollection);
      }
    }

    // console.log("button clickAction", clickAction, source_app, target_app, source_collection);
    if (
      clickAction === "copyCollection" &&
      source_app !== undefined &&
      source_app.key !== "" &&
      target_app !== undefined &&
      target_app.key !== "" &&
      source_collection !== undefined
    ) {
      // {{a.1.c.59.r.134.ca90b5f1-a487-4f31-bcdb-35127c725f13}}
      // {{a.1.c.59.r.135.ca90b5f1-a487-4f31-bcdb-35127c725f13}}
      // console.log("button clickAction copyCollection", source_app, source_collection, target_app);

      if (
        collection_display_name !== undefined &&
        collection_display_name.trim() !== "" &&
        collection_name !== undefined &&
        collection_name.trim() !== ""
      ) {
        // console.log(
        //   "button clickAction addCollection",
        //   app,
        //   collection_display_name,
        //   collection_name
        // );

        const newCollection = {
          displayName: collection_display_name,
          name: collection_name,
        };

        target_app.pushCopyCollection(
          source_app.key,
          source_collection as string,
          newCollection
        );
      }
    }

    if (
      clickAction === "addColumn" &&
      components !== undefined &&
      components.key !== ""
    ) {
      // console.log(
      //   "button clickAction addColumn",
      //   components,
      //   column_name,
      //   column_type
      // );

      if (
        column_name !== undefined &&
        column_name.trim() !== "" &&
        column_type !== undefined &&
        column_type.trim() !== ""
      ) {
        components.createSchemaField({ name: column_name, type: column_type });
      }
    }

    if (
      clickAction === "addRow" &&
      components?.key !== undefined &&
      components.key !== ""
    ) {
      // console.log("button clickAction addRow", components);
      const contents = {};
      components.createRecord(contents);
    }

    if (
      clickAction === "copyRow" &&
      components?.key !== undefined &&
      components.key !== "" &&
      source_app !== undefined &&
      source_app.key !== "" &&
      target_app !== undefined &&
      target_app.key !== "" &&
      source_collection !== undefined
    ) {
      const record_to_copy = (source_collection as Collection<any>)?.records[
        source_record
      ];
      // console.log("button clickAction copyRow", components, record_to_copy);
      
      target_app.pushCopyRecord(
        source_app.key,
        (source_collection as Collection<any>).key,
        record_to_copy.key,
        target_app.key,
        components.key
      );
    }
  }

  return (
    <Button data-plugin="plugin-button-v1" onClick={handleClick}>
      {label}
    </Button>
  );
}
