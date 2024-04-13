"use client";
import * as React from "react";
import Link from "next/link";
import MenuItem from "@mui/material/MenuItem";
import useRecords from "../../../store/useRecords";

export function AppBarMenuItem({ page, segment, handleCloseNavMenu }) {
  // const { display_name, path } = useRecords(page, ["display_name", "path"]);
  const { display_name, path } = useRecords({
    display_name: { record: page },
    path: { record: page },
  });

  if (!display_name?.value || !path?.value) {
    return null;
  }

  return (
    <MenuItem onClick={handleCloseNavMenu}>
      <Link href={`/subscriptions/${segment}${path.value}`}>
        {display_name.value}
      </Link>
    </MenuItem>
  );
}
