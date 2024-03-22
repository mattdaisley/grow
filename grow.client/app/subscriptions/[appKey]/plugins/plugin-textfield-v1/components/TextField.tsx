"use client";

import * as React from "react";

import Link from "next/link";
import TextField from "@mui/material/TextField";

import useRecord from "../../../store/useRecord";
import useCollection from "../../../store/useCollection";
import { Box } from "@mui/material";

export default function PluginTextField({ value, label }) {
  // console.log('Rendering PluginTextField');

  // const pages = useCollection(props.pages);

  return (
    <Box sx={{ padding: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        label={label}
        value={value ?? ""}
      />
    </Box>
  );
}

// function AppBarMenuItem({ page, handleCloseNavMenu }) {
//   const displayName = useRecord(page, "display_name");
//   const path = useRecord(page, "path");

//   return (
//     <MenuItem onClick={handleCloseNavMenu}>
//       <Link href={`${path}`}>{displayName}</Link>
//     </MenuItem>
//   );
// }
