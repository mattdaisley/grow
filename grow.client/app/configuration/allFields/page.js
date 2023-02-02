'use client'

import { useState, useEffect, useMemo } from 'react'

import useStorage from '../../../services/useStorage';
import { DynamicAppBar } from '../../[dynamic]/DynamicAppBar';
import { DynamicFields } from '../../[dynamic]/DynamicFields';
import { DynamicForm } from '../../[dynamic]/DynamicForm';
import { getFieldValues } from '../../../services/getFieldValues';
import Grid from '@mui/material/Unstable_Grid2';
import { Paper } from '@mui/material';
import TextField from '@mui/material/TextField';

function getDynamicFormData(props) {

  const fields = getFieldValues(props.allFields.item.fields)
  console.log(fields)

  const dynamicFormData = {
    currentPage: {
      name: "All Fields",
      groups: [
        {
          id: 0,
          views: [
            {
              id: 0,
              groups: [
                {
                  id: 0,
                  fields: [...fields.viewFields]
                }
              ]
            }
          ]
        }
      ]
    },
    fieldValues: { ...fields.viewFieldValues },
    timestamp: Date.now()
  }

  return dynamicFormData
}

export default function AllFieldsPage() {

  const allFields = useStorage('allfields');
  console.log(allFields);

  if (!allFields?.item) {
    return null;
  }

  return <DynamicFieldsForm allFields={allFields} />
}

function DynamicFieldsForm(props) {

  const dynamicItem = { item: { name: "configuration" } }

  const dynamicFormData = useMemo(() => getDynamicFormData(props), [
    props.allFields.timestamp
  ]);

  // const dynamicFormData = useMemo(() => getDynamicFormData(props), [
  //   allFields.timestamp
  // ]);

  function onSubmit(data) {
    console.log('onSubmit', data)
    // display form data on success
    // allFields.setItem(data)
    // setFormResults(JSON.stringify(data, null, 4));
  }

  if (dynamicFormData)

    return (
      <>
        <DynamicAppBar dynamicItem={dynamicItem} dynamicFormData={dynamicFormData} />
        <Grid container xs={12} spacing={0}>
          <Grid xs={8}>
            <DynamicForm dynamicFormData={dynamicFormData} onSubmit={onSubmit}>
              <DynamicFields currentPage={dynamicFormData.currentPage} />
            </DynamicForm>
          </Grid>
          <Grid xs={4}>

            <Paper sx={{ width: '100%' }}>
              {/* <TextField
                id="json-input"
                label="JSON"
                placeholder="{}"
                multiline
                fullWidth
                maxRows={38}
                value={currentAllFieldsJson}
                onChange={handleJsonChanged}
              /> */}
            </Paper>
          </Grid>
        </Grid>
      </>
    );
}