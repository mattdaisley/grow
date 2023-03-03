'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

import useGardens from '../../../services/gardens.service';
import { drawerWidth } from './drawerWidth';

const pages = [
  { name: "Gardens", path: "/gardens" },
  // { name: "Contexts", path: "/configuration/contexts" },
  { name: "Pages", path: "/configuration/pages" },
  { name: "Views", path: "/configuration/views" },
  { name: "Fields", path: "/configuration/fields" },
];

export default function GardenLayout({ children }) {

  const pathname = usePathname();
  console.log(pathname)
  const pathnameKeys = pathname.split('/');
  console.log(pathnameKeys)
  const gardenId = Number(pathnameKeys[2]);

  const [mobileOpen, setMobileOpen] = useState(false);

  const { currentGardenDefinition, currentGardenJson, currentGardenFieldDefaults, updateGarden } = useGardens(gardenId);

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
      <List>
        {currentGardenDefinition?.pages.length > 0 && currentGardenDefinition?.pages.map((page, index) => (
          <ListItem key={page.id} disablePadding>
            <ListItemButton>
              <Link href={`/gardens/${encodeURIComponent(gardenId)}/${page.id}`}>
                <ListItemText primary={page.name} sx={{ '& .MuiListItemText-primary': { fontWeight: 'light' } }} />
              </Link>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem key={page.name} disablePadding>
            <ListItemButton>
              <Link href={page.path}>
                <ListItemText primary={page.name} sx={{ '& .MuiListItemText-primary': { fontWeight: 'light' } }} />
              </Link>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <Box sx={{ display: 'flex', flex: 1 }}>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
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
            display: { xs: 'block', sm: 'none' },
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
            display: { xs: 'none', sm: 'block' },
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
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 4, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        {children}
      </Box>
    </Box>
  );
}