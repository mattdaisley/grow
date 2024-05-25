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
}

export default function PluginSelect({
  menuItemsCollection,
  value,
  onChange,
  label = "",
  width,
  menuItemField,
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

  // if (props.sort_key) {
  //   menuItems.sort((a, b) => {
  //     // console.log(a, b);
  //     if (a[1].value["display_name"] < b[1].value["display_name"]) {
  //       return -1;
  //     }
  //     if (a[1].value["display_name"] > b[1].value["display_name"]) {
  //       return 1;
  //     }
  //     return 0;
  //   });
  // }
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
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {menuItems.map(([key, menuItemRecord]) => {
          // console.log("PluginSelect menuItemRecord", menuItemRecord);
          return (
            <MenuItem key={key} value={key}>
              {(menuItemField && menuItemRecord.value[menuItemField]) ??
                menuItemRecord.value["display_name"]}
            </MenuItem>
          );
        })}
      </TextField>
    </Grid>
  );
}
