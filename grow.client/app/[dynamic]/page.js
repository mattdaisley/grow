'use client'

import { usePathname } from "next/navigation"
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

import useStorage from "../../services/useStorage";
// import { DynamicItemForm } from "./DynamicItemForm";

export default function DynamicPageList() {

  const pathname = usePathname();
  const pathnameKeys = pathname.split('/');

  const dynamicItemsName = pathnameKeys[1]

  // const allPages = useStorage('allpages');
  // const allViews = useStorage('allviews');
  // const allFields = useStorage('allfields');
  const dynamicItem = useStorage(`all${dynamicItemsName}`);

  if (!dynamicItem?.item) {
    return <Box sx={{ flexGrow: 1, py: 4, px: { xs: 2, md: 4 } }}>Loading...</Box>;
  }

  const newId = uuidv4();

  // console.log(dynamicItem.item[dynamicItemsName])

  const columns = [
    {
      field: 'id', headerName: 'ID', width: 70, hideable: false
    },
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'pages',
      headerName: 'Page Count',
      type: 'number',
      width: 160,
      valueGetter: (params) =>
        `${params.row.pages?.length || ''}`,
    },
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
            <Grid><Link href={`/${dynamicItemsName}/${encodeURIComponent(params.row.id)}`}>View</Link></Grid>
            <Grid><Link href={`/${dynamicItemsName}/edit/${encodeURIComponent(params.row.id)}`}>Edit</Link></Grid>
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
            {dynamicItem?.item[dynamicItemsName].length > 0 && (
              <DataGrid
                rows={dynamicItem?.item[dynamicItemsName]}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
              />
            )}
          </Grid>
          <Grid xs={12} sx={{ p: 1 }}>
            <Link href={`/${dynamicItemsName}/edit/${encodeURIComponent(newId)}`}>
              <Button>Add New Garden</Button>
            </Link>
          </Grid>
        </Paper>
      </Grid>
    </Box>
  )
}