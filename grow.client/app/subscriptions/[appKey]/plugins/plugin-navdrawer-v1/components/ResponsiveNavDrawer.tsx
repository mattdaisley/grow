"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { drawerWidth } from "./NavDrawer";

export function ResponsiveNavDrawer({ segment, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="a"
          href={`/subscriptions/${segment}`}
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
          App {segment.toUpperCase()}
        </Typography>
      </Toolbar>
      <List>{children}</List>
    </Box>
  );

  const isSSR = () => typeof window === "undefined";
  const container = !isSSR() ? () => window.document.body : undefined;

  return (
    <Box
      data-plugin="plugin-navdrawer-v1"
      component="nav"
      sx={{
        position: "fixed",
        width: { md: drawerWidth },
        height: "100%",
        maxHeight: "100vh",
        overflowX: "hidden",
        overflowY: "auto",
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
            position: "absolute",
            boxSizing: "border-box",
            width: drawerWidth,
            height: "100%",
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
