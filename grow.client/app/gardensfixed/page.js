'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link'

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { DataGrid } from '@mui/x-data-grid';

import useGardens from '../../services/gardens.service';

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
          <Grid><Link href={`/gardens/${encodeURIComponent(params.row.id)}`}>View</Link></Grid>
          <Grid><Link href={`/gardens/edit/${encodeURIComponent(params.row.id)}`}>Edit</Link></Grid>
        </Grid>
      )
    }
  },
];

export default function GardensPage() {

  const [lastId, setLastId] = useState(-1);

  const { allGardensDefinition } = useGardens();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!!allGardensDefinition && allGardensDefinition.gardens) {
      setLoading(false)

      const allGardenIds = allGardensDefinition.gardens.map(x => x.id) ?? [-1];
      // console.log(allGardensDefinition, allGardenIds)
      var parsedLastId = Math.max(...allGardenIds);
      setLastId(parsedLastId);
    }
  }, [JSON.stringify(allGardensDefinition)])

  // console.log('allGardensDefinition: ', allGardensDefinition)

  if (loading) {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Container>
        <Grid container spacing={2}>
          <Grid xs={12} style={{ minHeight: 400, backgroundColor: 'white' }}>
            {allGardensDefinition?.gardens.length > 0 && (
              <DataGrid
                rows={allGardensDefinition?.gardens}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
              />
            )}
          </Grid>
          <Grid xs={12}>
            <Link href={`/gardens/edit/${encodeURIComponent(lastId + 1)}`}>
              <Button>Add New Garden</Button>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
