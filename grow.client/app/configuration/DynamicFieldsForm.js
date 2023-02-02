'use client';

import { useState, useEffect, useMemo } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { Box, Paper } from '@mui/material';
import TextField from '@mui/material/TextField';

import { DynamicAppBar } from '../[dynamic]/DynamicAppBar';
import { DynamicFields } from '../[dynamic]/DynamicFields';
import { DynamicForm } from '../[dynamic]/DynamicForm';

export function DynamicFieldsForm({ getDynamicFormData, json, setItem, deps, ...props }) {

  const [currentJson, setCurrentJson] = useState("");

  const dynamicFormData = useMemo(() => getDynamicFormData(props), [
    ...deps
  ]);

  useEffect(() => {
    setCurrentJson(json);

  }, [json]);

  // const dynamicFormData = useMemo(() => getDynamicFormData(props), [
  //   allFields.timestamp
  // ]);
  function onSubmit(data) {
    console.log('onSubmit', data);
    // display form data on success
    // allFields.setItem(data)
    // setFormResults(JSON.stringify(data, null, 4));
  }

  function handleJsonChanged(event) {
    const rawJson = event.target.value;
    setCurrentJson(rawJson);
    // console.log('handleJsonChanged', rawJson)
    setItem(rawJson);
  }

  if (dynamicFormData)
    return (
      <>
        <DynamicAppBar dynamicItem={props.dynamicItem} dynamicFormData={dynamicFormData} />
        <Grid container xs={12} spacing={0}>
          <Grid xs={8}>
            <DynamicForm dynamicFormData={dynamicFormData} onSubmit={onSubmit}>
              <DynamicFields currentPage={dynamicFormData.currentPage} />
            </DynamicForm>
          </Grid>
          <Grid xs={4}>

            <Box sx={{ flexGrow: 1, py: 4, pr: { xs: 2, md: 4 } }}>
              <Paper sx={{ width: '100%' }}>
                <TextField
                  id="json-input"
                  label="JSON"
                  placeholder="{}"
                  multiline
                  fullWidth
                  maxRows={38}
                  value={currentJson}
                  onChange={handleJsonChanged} />
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </>
    );
}
