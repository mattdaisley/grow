'use client'


import { usePathname } from 'next/navigation';

import Box from '@mui/material/Box';

import useStorage from '../../services/useStorage';
import { drawerWidth, DynamicAppDrawer } from './DynamicAppDrawer';


export default function DynamicLayout({ children }) {
  const pathname = usePathname();
  // console.log(pathname)
  const pathnameKeys = pathname.split('/');
  // console.log(pathnameKeys)

  const dynamicItemName = pathnameKeys[1]
  const id = Number(pathnameKeys[2])

  const { item: allDynamicItems, timestamp: dynamicItemsTimestamp } = useStorage(`all${dynamicItemName}`);

  const currentItem = allDynamicItems?.[dynamicItemName].find(item => item.id === id)

  // console.log(allDynamicItems, allDynamicItems?.[dynamicItemName], dynamicItemsTimestamp, id, currentItem)

  return (
    <Box sx={{ display: 'flex', flex: 1 }}>
      <DynamicAppDrawer dynamicItemName={dynamicItemName} id={id} currentItem={currentItem} />
      <Box
        component="main"
        sx={(theme) => {
          // // console.log(theme, theme.spacing(2))
          return ({
            flexGrow: 1,
            pl: `${drawerWidth}px`,
            // width: {sm: `calc(100% - ${drawerWidth}px)` },
            width: 1,
            height: 1,
            position: 'fixed',
            overflowY: 'scroll'
          })
        }
        }
      >
        {children}
      </Box>
    </Box>
  )
}

