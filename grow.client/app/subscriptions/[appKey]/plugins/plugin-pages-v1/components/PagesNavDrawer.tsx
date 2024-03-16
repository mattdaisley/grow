"use client";

import { useState } from "react";
import { flatten } from "flat";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";

import AutoModeIcon from "@mui/icons-material/AutoMode";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export const drawerWidth = 200;

function Text(props) {
  const flattenedSource = flatten(props.source);
  console.log(flattenedSource)

  return <>{flattenedSource[props.selector]}</>;
}

export function PagesNavDrawer({ pages, appKey }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const segment = appKey;

  const drawer = (
    <Box>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="a"
          href={`/testing/${segment}`}
          sx={{
            mr: 1,
            display: { xs: "none", md: "flex" },
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          {segment.toUpperCase()}
        </Typography>
      </Toolbar>
      <List>
        {Object.keys(pages).map((page) => (
          <ListItem key={page} disablePadding>
            <ListItemButton>
              <Link
                href={`/subscriptions/${segment}/${page}`}
                style={{ width: "100%" }}
              >
                <ListItemText
                  primary={<Text source={pages} selector={`${page}.display_name`} />}
                  sx={{ "& .MuiListItemText-primary": { fontWeight: "light" } }}
                />
              </Link>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const isSSR = () => typeof window === "undefined";
  const container = !isSSR() ? () => window.document.body : undefined;

  return (
    <Box
      component="nav"
      sx={{
        position: "absolute",
        width: { md: drawerWidth },
        flexShrink: { md: 0 },
      }}
      aria-label="app drawer"
    >
      {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
      <Drawer
        container={container}
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        // PaperProps={{
        //   sx: { bgcolor: 'primary.main' }
        // }}
        sx={(theme) => ({
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            bgcolor: theme.palette.primary.main,
          },
        })}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={(theme) => ({
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            bgcolor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText,
          },
        })}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
