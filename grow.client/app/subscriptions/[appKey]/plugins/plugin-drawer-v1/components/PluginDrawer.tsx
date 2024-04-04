"use client";

import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { IconButton } from "@mui/material";

import useAppState from "../../../store/useAppState";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";

export default function PlugiDrawer({ anchor, components, variant, ...props }) {
  // console.log("PluginDrawer", anchor, components variant, props);

  const [open, setOpen] = useState(true);

  const { onChange: setDrawerHeight } = useAppState("drawerHeight");
  const { onChange: setDrawerWidth } = useAppState("drawerWidth");

  useEffect(() => {
    if (variant === "persistent" && anchor === "bottom") {
      setDrawerHeight && setDrawerHeight(open ? 400 : 56.8);
    }
    if (variant === "persistent" && (anchor === "right" || anchor === "left")) {
      setDrawerWidth && setDrawerWidth(open ? 200 : 20);
    }
  }, [setDrawerHeight, setDrawerWidth, anchor, variant, open]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Drawer
      variant={variant}
      anchor={anchor}
      open={true}
      hideBackdrop={true}
      // onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      <Box
        sx={{
          height: open ? 400 : 56.8,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            p: 1,
            px: 2,
            borderBottom: "1px solid white",
          }}
        >
          <IconButton onClick={toggleDrawer}>
            {open && <ExpandMore />}
            {!open && <ExpandLess />}
          </IconButton>
        </Box>
        {open && (
          <Box sx={{ height: 1 }}>
            <ComponentsCollection components={components} />
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
