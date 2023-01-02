import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";

import Link from 'next/link'

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import { DataGrid } from '@mui/x-data-grid';

import { Item } from '../components/index';
import useView from '../../services/views.service';
import { RenderedFields, RenderedViews } from '../components/RenderedFields';
import usePages from '../../services/pages.service';
import useGardens from '../../services/gardens.service';

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
    renderCell: (params) => <Link href={`/gardens/${encodeURIComponent(params.row.gardenId)}/${encodeURIComponent(params.row.id)}`}>Edit</Link>
  },
];

export default function GardenPage({ gardenId }) {

  const { control, handleSubmit, reset, formState } = useForm();
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ name: 'testfrom', control });

  const [formResults, setFormResults] = useState();

  const { currentGardenDefinition, currentGardenJson, currentGardenFieldDefaults, updateGarden } = useGardens(gardenId);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    console.log(currentGardenDefinition);
    if (!!currentGardenDefinition) {
      setLoading(false);
    }

  }, [JSON.stringify(currentGardenDefinition)])

  const handleJsonChanged = (event) => {
    const rawJson = event.target.value;
    updateGarden(rawJson);
  }

  function onSubmit(data) {
    // display form data on success
    setFormResults(JSON.stringify(data, null, 4));
  }

  function resetForm() {
    setFormResults();
    reset();
  }

  // console.log("currentPageDefinition", currentPageDefinition, "currentPageFieldDefaults", currentPageFieldDefaults)

  if (loading) {
    return null;
  }
  console.log(currentGardenDefinition, currentGardenJson);
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid xs={8} style={{ minHeight: 400, backgroundColor: 'white' }}>
              {currentGardenDefinition?.pages.length > 0 && (
                <DataGrid
                  rows={currentGardenDefinition?.pages.map(page => { return { ...page, gardenId } })}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                />
              )}
            </Grid>
            <Grid xs={4}>
              <Item>
                <TextField
                  id="json-input"
                  label="JSON"
                  placeholder="{}"
                  multiline
                  fullWidth
                  value={currentGardenJson}
                  onChange={handleJsonChanged}
                />
              </Item>
            </Grid>
          </Grid>
        </Box>
      </form>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  // Fetch data from external API

  // Pass data to the page via props
  return { props: { gardenId: Number(params.pid) } }
}