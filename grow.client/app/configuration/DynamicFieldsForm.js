'use client';

import { useState, useEffect, useMemo } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';

import { DynamicAppBar } from '../[dynamic]/DynamicAppBar';
import { DynamicFields } from '../[dynamic]/DynamicFields';
import { DynamicForm } from '../[dynamic]/DynamicForm';
import FieldsEditor from './FieldsEditor/FieldsEditor';

export function DynamicFieldsForm({ getDynamicFormData, setDynamicFormData, json, setItem, deps, ...props }) {

  const [currentJson, setCurrentJson] = useState(json);

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
    // console.log('onSubmit', data);
    // display form data on success
    // allFields.setItem(data)
    // setFormResults(JSON.stringify(data, null, 4));
  }

  function handleJsonChanged(event) {
    const newJson = event.target.value;
    setCurrentJson(newJson);
    console.log('handleJsonChanged', newJson)
    setItem && setItem(newJson);
  }

  function handleFieldsEditorChange(newValue) {
    // setCurrentJson(newJson);
    console.log('handleFieldsEditorChange', newValue)
    setDynamicFormData && setDynamicFormData(newValue, setItem);
  }

  // console.log(dynamicFormData)

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
          <FieldsEditor
            dynamicFormData={dynamicFormData}
            json={currentJson}
            deps={deps}
            onEditorChange={handleFieldsEditorChange}
            onJsonChange={handleJsonChanged}
            {...props} />
        </Grid>
      </>
    );
}
