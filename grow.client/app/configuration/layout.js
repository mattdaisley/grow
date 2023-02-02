'use client';

import Box from "@mui/material/Box";
import { drawerWidth, DynamicAppDrawer } from "../[dynamic]/DynamicAppDrawer";

export default function ConfigurationLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', flex: 1 }}>
      <DynamicAppDrawer />
      <Box
        component="main"
        sx={(theme) => {
          // // console.log(theme, theme.spacing(2))
          return ({
            flexGrow: 1,
            pl: `${drawerWidth}px`,
            // width: {sm: `calc(100% - ${drawerWidth}px)` },
            width: 1,
            height: 'calc(100% - 64px)',
            position: 'fixed',
            overflowY: 'scroll'
          })
        }}
      >
        {children}
      </Box>
    </Box>
  )
}