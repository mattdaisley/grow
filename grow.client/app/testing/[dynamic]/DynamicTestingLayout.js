'use client'

import Box from "@mui/material/Box";


import { SocketContext, socket } from '../../SocketContext';
import { drawerWidth, DynamicAppDrawer } from "./DynamicAppDrawer";
import DynamicAppBar from "./DynamicAppBar";

export function DynamicTestingLayout({ children, pages, appKey }) {
  return (
    <SocketContext.Provider value={socket}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        <DynamicAppBar pages={pages} />
        <DynamicAppDrawer pages={pages} appKey={appKey} />
        <Box
          component="main"
          sx={(theme) => {
            // // console.log(theme, theme.spacing(2))
            return ({
              flexGrow: 1,
              pl: { xs: 0, md: `${drawerWidth}px` },
              pt: { xs: `64px` },
              // width: {sm: `calc(100% - ${drawerWidth}px)` },
              width: 1,
              height: '100%',
              position: 'fixed',
              overflowY: 'scroll'
            });
          }}
        >
          {children}
        </Box>
      </Box>
    </SocketContext.Provider>
  );
}
