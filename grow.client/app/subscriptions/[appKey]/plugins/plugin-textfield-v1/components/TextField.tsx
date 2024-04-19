"use client";

import * as React from "react";

import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Unstable_Grid2";

export default function PluginTextField({ value, label, readonly, onChange }) {
  // console.log("Rendering PluginTextField", value, label);

  function handleChange(e) {
    // console.log("PluginTextField handleChange", e.target.value);
    onChange(e.target.value);
  }

  const inputProps: any = {};

  if (readonly) {
    inputProps.readOnly = true;
  }

  return (
    <Grid xs={12} sx={{ padding: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        label={label ?? ""}
        value={value ?? ""}
        onChange={handleChange}
        InputProps={inputProps}
      />
    </Grid>
  );
}
