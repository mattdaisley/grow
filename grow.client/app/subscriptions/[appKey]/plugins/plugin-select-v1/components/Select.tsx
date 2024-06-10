"use client";

import * as React from "react";

import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Unstable_Grid2";
import { MenuItem } from "@mui/material";
import useCollections from "../../../store/useCollections";

interface IPluginSelectProps {
  menuItemsCollection: any;
  value: string;
  onChange: Function;
  label?: string;
  width?: number;
  menuItemField?: string;
  value_field?: string;
  sort_key?: string;
  readonly?: boolean;
}

export default function PluginSelect({
  menuItemsCollection,
  value,
  onChange,
  label = "",
  width,
  menuItemField,
  value_field,
  sort_key,
  readonly = false,
}: IPluginSelectProps) {
  const menuItemsResponse = useCollections([menuItemsCollection]);
  // console.log(
  //   "PluginSelect",
  //   menuItemsCollection,
  //   menuItemsResponse,
  //   width,
  //   typeof width
  // );
  if (
    !menuItemsResponse ||
    !menuItemsResponse[menuItemsCollection.key]?.records
  ) {
    return null;
  }

  const menuItemRecords = menuItemsResponse[menuItemsCollection.key].records;

  let menuItems = Object.entries(menuItemRecords);

  if (sort_key !== undefined) {
    menuItems.sort((a, b) => {
      // console.log(a, b);
      if (a[1].value[sort_key] < b[1].value[sort_key]) {
        return -1;
      }
      if (a[1].value[sort_key] > b[1].value[sort_key]) {
        return 1;
      }
      return 0;
    });
  }
  // console.log("Rendering PluginSelect", value, label);

  function handleChange(e) {
    // console.log(
    //   "PluginSelect handleChange",
    //   typeof e.target.value,
    //   e.target.value
    // );
    onChange(e.target.value);
  }

  const fieldWidth = width === 0 ? 12 : Number(width ?? 12);

  const inputProps: any = {};

  if (readonly) {
    inputProps.readOnly = true;
  }

  return (
    <Grid
      data-plugin="plugin-select-v1"
      xs={12}
      sm={fieldWidth}
      sx={{
        padding: 1,
      }}
    >
      <TextField
        select
        fullWidth
        variant="outlined"
        size="small"
        sx={{ fontSize: "small" }}
        label={label ?? ""}
        value={value ?? ""}
        onChange={handleChange}
        InputProps={inputProps}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {menuItems.map(([key, menuItemRecord]) => {
          // console.log(
          //   "PluginSelect menuItemRecord",
          //   value_field,
          //   menuItemRecord
          // );
          const value =
            value_field !== undefined
              ? menuItemRecord.value[
                  menuItemRecord.schema.fields[value_field].name
                ]
              : key;
          return (
            <MenuItem key={key} value={value}>
              {(menuItemField && menuItemRecord.value[menuItemField]) ??
                menuItemRecord.value["display_name"]}
            </MenuItem>
          );
        })}
      </TextField>
    </Grid>
  );
}
