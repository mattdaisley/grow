'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

import { Item } from '../../fields/page';
import useView from '../../../../services/views.service';
import { RenderedFields } from '../../../../components/Rendering/RenderedFields';

export default function ViewPage({ params }) {

  const viewId = Number(params.pid);

  const { control, handleSubmit, reset, formState } = useForm();
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ name: 'testfrom', control });

  const [formResults, setFormResults] = useState();

  const { currentViewDefinition, currentViewJson, currentViewFieldDefaults, updateCurrentView } = useView(viewId);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!!currentViewFieldDefaults) {
      // console.log(currentViewFieldDefaults);
      reset({ ['testform']: [currentViewFieldDefaults] });
      setLoading(false);
    }

  }, [JSON.stringify(currentViewFieldDefaults)])

  const handleJsonChanged = (event) => {
    const rawJson = event.target.value;
    updateCurrentView(rawJson);
  }

  function onSubmit(data) {
    // display form data on success
    setFormResults(JSON.stringify(data, null, 4));
  }

  function resetForm() {
    setFormResults();
    reset();
  }

  if (loading) {
    return null;
  }

  // console.log("currentViewDefinition", currentViewDefinition, "currentViewFieldDefaults", currentViewFieldDefaults)
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container xs={12} spacing={2}>
            <Grid container xs={8} alignContent={'flex-start'}>
              <Box sx={{ width: '100%' }}>
                <Stack spacing={2}>
                  <Paper sx={{ padding: 0 }}>
                    <Grid xs={12} container alignContent={'flex-start'}>
                      <RenderedFields viewDefinition={currentViewDefinition} control={control} />
                    </Grid>
                  </Paper>
                </Stack>
              </Box>

              <Grid xs={12}>
                <Button type="submit">Submit</Button>
                <Button onClick={resetForm}>Reset</Button>
              </Grid>

              <Grid xs={12}>
                <div>Form Results</div>
                {formResults && (
                  <TextField
                    id="form-results"
                    multiline
                    fullWidth
                    value={formResults}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                )}
              </Grid>
            </Grid>

            <Grid xs={4}>
              <Item>
                <TextField
                  id="json-input"
                  label="JSON"
                  placeholder="{}"
                  multiline
                  fullWidth
                  value={currentViewJson}
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