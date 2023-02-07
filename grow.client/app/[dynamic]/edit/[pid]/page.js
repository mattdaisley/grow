'use client'

import { useState } from 'react';

import { usePathname } from "next/navigation"
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid';

import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { DataGrid } from '@mui/x-data-grid';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';

import useStorage from "../../../../services/useStorage";
// import { DynamicItemForm } from "./DynamicItemForm";

export default function EditDynamicPage() {

  const pathname = usePathname();
  const pathnameKeys = pathname.split('/');

  const dynamicItemsName = pathnameKeys[1]
  const id = Number(pathnameKeys[3])

  const [addingPage, setAddingPage] = useState(false);
  const [addingPageValue, setAddingPageValue] = useState();

  const allPages = useStorage('allpages');
  // const allViews = useStorage('allviews');
  // const allFields = useStorage('allfields');
  const dynamicItems = useStorage(`all${dynamicItemsName}`);

  if (!dynamicItems?.item || !allPages?.item) {
    return <Box sx={{ flexGrow: 1, py: 4, px: { xs: 2, md: 4 } }}>Loading...</Box>;
  }

  const currentDynamicItem = dynamicItems.item[dynamicItemsName].find(item => item.id === id)
  // console.log(currentDynamicItem.pages, allPages.item.pages)
  let dynamicItem
  if (currentDynamicItem !== undefined) {
    const newPages = [...currentDynamicItem.pages].map(page => allPages.item.pages.find(p => p.id === page.pageId))
    // console.log(newPages)
    dynamicItem = { ...currentDynamicItem, pages: [...newPages] }
  }
  else {
    const newId = uuidv4();
    dynamicItem = { id: newId, pages: [] }
  }
  // console.log(dynamicItem)

  const handleAddPageClick = () => {
    setAddingPage(true)
  }

  const handleAddPageConfirmClick = () => {
    // console.log(addingPageValue)
    setAddingPage(false)

    // const newId = uuidv4();
    // console.log(newPages)
    const newDynamicItems = dynamicItems.item[dynamicItemsName].map(item => {
      if (item.id === id) {
        return { ...item, pages: [...item.pages, { pageId: addingPageValue.value }] }
      }
      return item;
    })

    dynamicItems.setItem({ ...dynamicItems.item, [dynamicItemsName]: [...newDynamicItems] })
  }

  const columns = [
    {
      field: 'id', headerName: 'ID', width: 70, hideable: false
    },
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 160,
      disableColumnMenu: true,
      hideable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        return (
          <Grid container spacing={2}>
            <Grid><Link href={`/${dynamicItemsName}/${encodeURIComponent(id)}/${encodeURIComponent(params.row.id)}`}>View</Link></Grid>
            <Grid><Link href={`/configuration/allPages/${encodeURIComponent(params.row.id)}`}>Edit</Link></Grid>
          </Grid>
        )
      }
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, py: 4, px: { xs: 2, md: 4 } }}>
      <Grid container xs={12} spacing={0}>
        <Paper sx={{ width: '100%' }}>
          <Grid xs={12} style={{ height: 600, backgroundColor: 'white' }}>
            {dynamicItem.pages.length > 0 && (
              <DataGrid
                rows={dynamicItem.pages}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
              />
            )}
          </Grid>
          <Grid xs={12} sx={{ p: 1 }}>
            {!addingPage && (
              <Button onClick={handleAddPageClick}>Add Page</Button>
            )}
            {addingPage && (
              <Box sx={{ p: 1 }}>
                <Autocomplete
                  label="Page"
                  autoComplete
                  autoSelect
                  autoHighlight
                  fullWidth
                  size="small"
                  options={allPages.item.pages.map(page => ({ value: page.id, label: page.name }))}
                  value={addingPageValue}
                  onChange={(_, newValue) => setAddingPageValue(newValue)}
                  isOptionEqualToValue={(option, testValue) => option?.id === testValue?.id}
                  renderInput={(params) => <TextField {...params} label="Page" />} />
                <Button
                  color="secondary"
                  size="small"
                  sx={{ mt: 1 }}
                  disabled={addingPageValue === undefined}
                  onClick={handleAddPageConfirmClick}>
                  Confirm
                </Button>
              </Box>
            )}
          </Grid>
        </Paper>
      </Grid>
    </Box>
  )
}