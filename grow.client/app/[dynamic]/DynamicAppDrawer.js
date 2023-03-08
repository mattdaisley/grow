'use client';

import { useState } from 'react';

import Link from 'next/link';

import AutoModeIcon from "@mui/icons-material/AutoMode";
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from "@mui/material/Typography";

import DrawerPageList from "./DrawerPageList";

export const drawerWidth = 200;

export const globalPages = [
  { name: "Gardens", path: "/gardens" },
  // { name: "Contexts", path: "/configuration/contexts" },
  { name: "Pages", path: "/admin/pages" },
  { name: "Views", path: "/admin/views" },
  { name: "Fields", path: "/admin/fields" },
];

export function DynamicAppDrawer({ dynamicItemName, id, currentItem }) {

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <AutoModeIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            display: { xs: "none", md: "flex" },
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          GROW
        </Typography>
      </Toolbar>
      {currentItem !== undefined && <>
        <DrawerPageList dynamicItemName={dynamicItemName} id={id} pages={currentItem?.pages} />
        <Divider />
      </>}
      <List>
        {globalPages.map((page) => (
          <ListItem key={page.name} disablePadding>
            <ListItemButton>
              <Link href={page.path} style={{ width: '100%' }}>
                <ListItemText primary={page.name} sx={{ '& .MuiListItemText-primary': { fontWeight: 'light' } }} />
              </Link>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const isSSR = () => typeof window === 'undefined';
  const container = !isSSR() ? () => window.document.body : undefined;

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
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
        PaperProps={{
          sx: { bgcolor: 'primary.main' }
        }}
        sx={(theme) => ({
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: theme.palette.background.main
          },
        })}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'background.main',
            color: 'primary.contrastText'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
