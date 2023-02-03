'use client'

import { useState, useEffect } from 'react';

import Link from 'next/link'

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import { DataGrid } from '@mui/x-data-grid';

import { DynamicAppBar } from '../../[dynamic]/DynamicAppBar';
import useStorage from '../../../services/useStorage';
// import { DynamicFieldsForm } from '../DynamicFieldsForm';

// import { getAllPagesDynamicFormData } from './getAllPagesDynamicFormData';


const columns = [
  {
    field: 'id', headerName: 'ID', width: 70, hideable: false
  },
  { field: 'name', headerName: 'Name', flex: 1 },
  {
    field: 'groups',
    headerName: 'Group Count',
    type: 'number',
    width: 160,
    valueGetter: (params) =>
      `${params.row.groups?.length || ''}`,
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
    renderCell: (params) => <Link href={`/configuration/allPages/${encodeURIComponent(params.row.id)}`}>Edit</Link>
  },
];

export default function AllPagesPage() {

  const allPages = useStorage('allpages');
  // console.log(allPages);

  if (allPages?.item?.pages === undefined) {
    return null;
  }

  const allPageIds = allPages.item.pages.map(x => x.id) ?? [-1];
  // console.log(allPagesDefinition, allPageIds)
  var lastId = Math.max(...allPageIds);

  const dynamicItem = { item: { name: "Configuration" } };
  const dynamicFormData = { currentPage: { name: "All Pages" }, timestamp: allPages.timestamp }

  return (
    <>
      <DynamicAppBar dynamicItem={dynamicItem} dynamicFormData={dynamicFormData} />
      <Grid container xs={12} spacing={0}>
        <Grid xs={12}>
          <Box sx={{ flexGrow: 1, p: 4 }}>
            <Paper sx={{ width: '100%', height: '600px' }}>
              {allPages.item.pages.length > 0 && (
                <DataGrid
                  rows={allPages?.item?.pages}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                />
              )}
              <Link href={`/configuration/allPages/${encodeURIComponent(lastId + 1)}`}>
                <Button>Add New Page</Button>
              </Link>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

