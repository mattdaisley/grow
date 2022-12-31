import { useState, useEffect, forwardRef, ChangeEvent } from 'react';

import Link from 'next/link'

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import { DataGrid } from '@mui/x-data-grid';

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
    renderCell: (params) => <Link href={`/components/views/${encodeURIComponent(params.row.id)}`}>Edit</Link>
  },
];

export default function ViewsPage() {

  const [allViewsJson, setAllViewsJson] = useState("");
  const [allViewsDefinition, setAllViewsDefinition] = useState();
  const [lastId, setLastId] = useState(0);

  useEffect(() => {
    const loadAllViews = () => {
      const localAllViewsJson = localStorage.getItem('allviews');
      // console.log('localAllViewsJson: ', localAllViewsJson)
      if (localAllViewsJson && localAllViewsJson !== allViewsJson) {
        try {
          setAllViewsJson(localAllViewsJson);

          var parsedJson = JSON.parse(localAllViewsJson);
          setAllViewsDefinition(parsedJson);

          const allViewIds = parsedJson.views.map(x => x.id) ?? 0;
          var parsedLastId = Math.max(...allViewIds);
          // console.log(allViewIds, parsedLastId);
          setLastId(parsedLastId);
        }
        catch (e) {
          console.log(e);
        }
      }
    }

    loadAllViews();

    const loadInterval = setInterval(loadAllViews, 2000);

    return () => clearInterval(loadInterval);
  }, []);

  // console.log('allViewsDefinition: ', allViewsDefinition)

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
            <Link href={`/components/views/${encodeURIComponent(lastId + 1)}`}>
              <Button>Add New View</Button>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
