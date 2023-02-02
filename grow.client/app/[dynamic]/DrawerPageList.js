'use client'

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

import useStorage from "../../services/useStorage";

export default function PagesMenuList({ dynamicItemName, id, pages }) {

  const { item: allPages, timestamp: pagesTimestamp } = useStorage('allpages');

  if (allPages === undefined) {
    return null;
  }

  const pageDefinitions = pages?.map(page => {
    const pageDefinition = allPages?.pages.find(x => x.id === page.pageId);
    // console.log(pageDefinition)
    return { ...pageDefinition }
  })

  // console.log(pageDefinitions, allPages, pages)

  return <List>
    {pageDefinitions?.length > 0 && pageDefinitions.map((page, index) => (
      <ListItem key={page.id} disablePadding>
        <Link href={`/${dynamicItemName}/${encodeURIComponent(id)}/${page.id}`} style={{ width: '100%' }}>
          <ListItemButton sx={{ width: '100%', display: 'flex', flex: 1 }}>
            <ListItemText primary={page.name} sx={{ '& .MuiListItemText-primary': { fontWeight: 'light' } }} />
          </ListItemButton>
        </Link>
      </ListItem>
    ))}
  </List>
}