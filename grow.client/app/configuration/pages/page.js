'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link'

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import { DataGrid } from '@mui/x-data-grid';
import usePages from '../../../services/pages.service';

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
    renderCell: (params) => <Link href={`/configuration/pages/${encodeURIComponent(params.row.id)}`}>Edit</Link>
  },
];

export default function PagesPage() {

  const [lastId, setLastId] = useState(-1);

  const { allPagesDefinition } = usePages();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!!allPagesDefinition && allPagesDefinition.pages) {
      setLoading(false)

      const allPageIds = allPagesDefinition.pages.map(x => x.id) ?? [-1];
      // console.log(allPagesDefinition, allPageIds)
      var parsedLastId = Math.max(...allPageIds);
      setLastId(parsedLastId);
    }
  }, [JSON.stringify(allPagesDefinition)])

  // console.log('allPagesDefinition: ', allPagesDefinition)

  if (loading) {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Container>
        <Grid container spacing={2}>
          <Grid xs={12} style={{ minHeight: 400, backgroundColor: 'white' }}>
            {allPagesDefinition?.pages.length > 0 && (
              <DataGrid
                rows={allPagesDefinition?.pages}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
              />
            )}
          </Grid>
          <Grid xs={12}>
            <Link href={`/components/pages/${encodeURIComponent(lastId + 1)}`}>
              <Button>Add New Page</Button>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
