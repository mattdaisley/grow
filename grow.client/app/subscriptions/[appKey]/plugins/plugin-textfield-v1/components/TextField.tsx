"use client";

import * as React from "react";

import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Unstable_Grid2";

interface IPluginTextFieldProps {
  value: string;
  onChange: Function;
  label?: string;
  readonly?: boolean;
  width?: number;
}

export default function PluginTextField({
  value,
  onChange,
  label = "",
  readonly = false,
  width,
}: IPluginTextFieldProps) {
  // console.log("Rendering PluginTextField", value, label, width);

  function handleChange(e) {
    // console.log("PluginTextField handleChange", e.target.value);
    onChange(e.target.value);
  }

  const inputProps: any = {};

  if (readonly) {
    inputProps.readOnly = true;
  }

  // console.log("PluginTextField", width, Number(width ?? 12));

  const fieldWidth = width === 0 ? 12 : Number(width ?? 12);

  return (
    <Grid
      data-plugin="plugin-textfield-v1"
      xs={12}
      sm={fieldWidth}
      sx={{ p: 1 }}
    >
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        sx={{ fontSize: "small" }}
        label={label ?? ""}
        value={value ?? ""}
        onChange={handleChange}
        InputProps={inputProps}
      />
    </Grid>
  );
}
