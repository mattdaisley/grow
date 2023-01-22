'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";

import Link from 'next/link'
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import { DataGrid } from '@mui/x-data-grid';

import { Item } from "../../../../components/Item";
import useGardens from '../../../../services/gardens.service';

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

export default function GardenPage({ params }) {
  const gardenId = Number(params.pid);

  const { control, handleSubmit, reset, formState } = useForm();
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ name: 'testfrom', control });

  const [formResults, setFormResults] = useState();

  const { currentGardenDefinition, currentGardenJson, currentGardenFieldDefaults, updateGarden } = useGardens(gardenId);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // console.log(currentGardenDefinition);
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
  // console.log(currentGardenDefinition, currentGardenJson);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ flexGrow: 1, padding: '1.5rem 1rem' }}>
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
  );
}