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
  variant?: "persistent" | "permanent" | "temporary";
}

export default function PlugiDrawer({
  anchor,
  components,
  variant,
  ...props
}: IPluginDrawerProps) {
  // console.log("PluginDrawer", anchor, components, variant, props);

  const [open, setOpen] = useState(true);

  const { drawerHeight } = useAppState("drawerHeight");
  const { drawerWidth } = useAppState("drawerWidth");

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
            <DrawerHeader />
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

function DrawerHeader() {
  const { selectedRecord } = useAppState("selectedRecord");
  // console.log("DrawerHeader", selectedRecord);

  return <>Selected record {selectedRecord?.value}</>;
}
