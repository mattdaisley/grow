'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link'

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { DataGrid } from '@mui/x-data-grid';

import useView from '../../../services/views.service';

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
      `${params.row.groups.length || ''}`,
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
    renderCell: (params) => <Link href={`/configuration/views/${encodeURIComponent(params.row.id)}`}>Edit</Link>
  },
];

export default function ViewsPage() {

  const [lastId, setLastId] = useState(0);

  const { allViewsDefinition } = useView();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!!allViewsDefinition && allViewsDefinition.views) {
      setLoading(false)

      const allViewIds = allViewsDefinition.views.map(x => x.id) ?? 0;
      var parsedLastId = Math.max(...allViewIds);
      setLastId(parsedLastId);
    }
  }, [JSON.stringify(allViewsDefinition)])

  // console.log('allViewsDefinition: ', allViewsDefinition)

  if (loading) {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Container>
        <Grid container spacing={2}>
          <Grid xs={12} style={{ minHeight: 400, backgroundColor: 'white' }}>
            {allViewsDefinition?.views.length > 0 && (
              <DataGrid
                rows={allViewsDefinition?.views}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
              />
            )}
          </Grid>
          <Grid xs={12}>
            <Link href={`/configuration/views/${encodeURIComponent(lastId + 1)}`}>
              <Button>Add New View</Button>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
