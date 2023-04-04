'use client'

import Box from "@mui/material/Box";
import { drawerWidth, DynamicAppDrawer } from "./DynamicAppDrawer";

export function DynamicTestingLayout({ children, pages }) {
  return (
    <Box sx={{ display: 'flex', flex: 1 }}>
      <DynamicAppDrawer pages={pages} />
      <Box
        component="main"
        sx={(theme) => {
          // // console.log(theme, theme.spacing(2))
          return ({
            flexGrow: 1,
            pl: { xs: 0, md: `${drawerWidth}px` },
            // width: {sm: `calc(100% - ${drawerWidth}px)` },
            width: 1,
            height: 'calc(100% - 64px)',
            position: 'fixed',
            overflowY: 'scroll'
          });
        }}
      >
        {children}
      </Box>
    </Box>
  );
}