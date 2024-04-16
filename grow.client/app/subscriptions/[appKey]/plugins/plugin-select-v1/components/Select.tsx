"use client";

import * as React from "react";

import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Unstable_Grid2";
import { MenuItem } from "@mui/material";
import useCollections from "../../../store/useCollections";

export default function PluginSelect({
  menuItemsCollection,
  value,
  label,
  onChange,
}) {
  const menuItemsResponse = useCollections([menuItemsCollection]);
  // console.log("PluginSelect", menuItemsResponse);
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

  return (
    <Grid xs={12} sx={{ padding: 2 }}>
      <TextField
        select
        fullWidth
        variant="outlined"
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
              {menuItemRecord.value["display_name"]}
            </MenuItem>
          );
        })}
      </TextField>
    </Grid>
  );
}
