"use client";

import * as React from "react";

import TextField from "@mui/material/TextField";

import { Box } from "@mui/material";

export default function PluginTextField({ value, label, onChange }) {
  // console.log("Rendering PluginTextField", value, label);

  return (
    <Box sx={{ padding: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        label={label ?? ""}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </Box>
  );
}
