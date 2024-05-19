"use client";

import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { IconButton } from "@mui/material";

import useAppState from "../../../store/useAppState";
import { ComponentsCollection } from "../../../store/components/ComponentsCollection";

interface IPluginDrawerProps {
  anchor?: "bottom" | "right" | "left" | "top";
  components: Record<string, any>;
  headerComponents?: Record<string, any>;
  variant?: "persistent" | "permanent" | "temporary";
}

export default function PluginDrawer({
  anchor,
  components,
  headerComponents,
  variant,
  ...props
}: IPluginDrawerProps) {
  // console.log("PluginDrawer", anchor, components, variant, props);

  const [open, setOpen] = useState(true);

  const { drawerHeight } = useAppState("drawerHeight", false);
  const { drawerWidth } = useAppState("drawerWidth", false);

  useEffect(() => {
    if (variant === "persistent" && anchor === "bottom") {
      drawerHeight?.onChange && drawerHeight.onChange(open ? 400 : 56.8);
    }
    if (variant === "persistent" && (anchor === "right" || anchor === "left")) {
      drawerWidth?.onChange && drawerWidth.onChange(open ? 200 : 20);
    }
  }, [drawerHeight?.onChange, drawerWidth?.onChange, anchor, variant, open]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Drawer
      data-plugin="plugin-drawer-v1"
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
            p: 1,
            px: 2,
            borderBottom: "1px solid white",
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <DrawerHeader headerComponents={headerComponents} />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <IconButton onClick={toggleDrawer}>
              {open && <ExpandMore />}
              {!open && <ExpandLess />}
            </IconButton>
          </Box>
        </Box>
        {open && (
          <Box sx={{ height: 1, display: "flex", overflow: "hidden" }}>
            <ComponentsCollection components={components} />
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

function DrawerHeader({ headerComponents }) {
  // console.log("DrawerHeader", headerComponents);
  if (!headerComponents) {
    return null;
  }

  return (
    <>
      <ComponentsCollection components={headerComponents} />
    </>
  );
}
