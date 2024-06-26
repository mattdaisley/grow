"use client";

import Link from "next/link";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import useRecords from "../../../store/useRecords";

export function NavItem({ segment, page }) {
  // const { display_name, path } = useRecords(page, ["display_name", "path"]);
  // console.log("NavItem", page, display_name, path);
  const { display_name, path } = useRecords({
    display_name: { record: page },
    path: { record: page },
  });

  return (
    <ListItem disablePadding>
      <Link
        href={`/subscriptions/${segment}${path.value}`}
        style={{ width: "100%" }}
      >
        <ListItemButton>
          <ListItemText
            primary={display_name.value}
            sx={{ "& .MuiListItemText-primary": { fontWeight: "light" } }}
          />
        </ListItemButton>
      </Link>
    </ListItem>
  );
}
