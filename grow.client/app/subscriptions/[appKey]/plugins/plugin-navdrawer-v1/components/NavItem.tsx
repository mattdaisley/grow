"use client";

import Link from "next/link";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import useRecord from "../../../store/useRecord";

export function NavItem({ segment, page }) {
  const [displayName] = useRecord(page, "display_name");
  const [path] = useRecord(page, "path");

  return (
    <ListItem disablePadding>
      <ListItemButton>
        <Link
          href={`/subscriptions/${segment}${path}`}
          style={{ width: "100%" }}
        >
          <ListItemText
            primary={displayName}
            sx={{ "& .MuiListItemText-primary": { fontWeight: "light" } }}
          />
        </Link>
      </ListItemButton>
    </ListItem>
  );
}
