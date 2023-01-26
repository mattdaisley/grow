'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, FormProvider } from "react-hook-form";

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

import { RenderField } from '../../../components/Rendering/RenderField';
import { getFieldDefault } from '../../../services/getFieldDefault';
import { PageContext } from '../../PageContext';

export const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  boxSizing: 'border-box',
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));

const initialJson = `{
  "fields": [
    {
      "type": "autocomplete",
      "props": { 
        "label": "test autocomplete",
        "fullWidth": true,
        "autoComplete": true,
        "autoSelect": true,
        "autoHighlight": true,
        "options": [ 
           { "label": "option 1" } ,
           { "label": "option 2" } 
         ]
       }
    },
    {
      "type": "select",
      "props": { 
        "label": "test select",
        "fullWidth": true,
        "options": [ 
           { "name": "option 1", "value": 0 } ,
           { "name": "option 2", "value": 1 } 
         ]
       }
    },
    {
      "type": "text",
      "props": { 
        "fullWidth": true,
        "label": "test text"
       }
    },
    {
      "type": "text",
      "props": { 
        "fullWidth": true,
        "label": "test text 2"
       }
    },
    {
      "type": "checkbox",
      "props": { 
        "label": "test checkbox"
       }
    },
    {
      "type": "checkbox",
      "props": { 
        "label": "test checkbox 2"
       }
    }
  ]
}`

const RenderedFields = ({ fieldsDefinition, control, fieldArrayName }) => {

  return (
    <Grid xs={12}>
      {fieldsDefinition?.fields?.map(fieldDefinition => {
        if (fieldDefinition.id === undefined || fieldDefinition.type === undefined) {
          return null;
        }
        return <RenderField field={fieldDefinition} key={`${fieldDefinition.id}`} control={control} fieldArrayName={fieldArrayName} />
      })}
    </Grid>
  )
}

export default function FieldsPage() {

  const fieldArrayName = 'testform';

  const [allFieldsJson, setAllFieldsJson] = useState("");
  const [allFieldsDefinition, setAllFieldsDefinition] = useState();

  const [fieldDefaults, setFieldDefaults] = useState(undefined);

  const methods = useForm();
  const { register, control, handleSubmit, reset, formState, watch } = methods;
  const { fields, append, remove } = useFieldArray({ name: fieldArrayName, control });

  useEffect(() => {
    const localJson = localStorage.getItem('allfields');
    // console.log('localJson: ', localJson)
    if (localJson) {
      setAllFieldsJson(localJson);

      try {
        var parsedJson = JSON.parse(localJson);
        setAllFieldsDefinition(parsedJson);
      }
      catch (e) {
        console.log(e);
      }
    }
    else {

      setAllFieldsJson(initialJson);

      try {
        var parsedJson = JSON.parse(initialJson);
        setAllFieldsDefinition(parsedJson);
      }
      catch {

      }
    }
  }, []);

  useEffect(() => {
    if (allFieldsJson === "") {
      return;
    }

    let fieldValues = {};

    // console.log("allFields", allFieldsDefinition);
    allFieldsDefinition?.fields.map(fieldDefinition => {
      // console.log(fieldDefinition);
      const fieldDefault = getFieldDefault(fieldDefinition)
      fieldValues[fieldDefinition.name] = fieldDefault;

    })

    reset({ [fieldArrayName]: [fieldValues] });
    setFieldDefaults(fieldValues);

  }, [allFieldsJson])

  const handleJsonChanged = (event) => {
    const rawJson = event.target.value;
    setAllFieldsJson(rawJson);

    try {
      // console.log('setting local json', rawJson)
      var parsedJson = JSON.parse(rawJson);

      localStorage.setItem('allfields', JSON.stringify(parsedJson, null, 2));

      setAllFieldsDefinition(parsedJson);
    }
    catch {

    }
  }

  // console.log("currentViewFieldDefaults", currentViewFieldDefaults)
  if (!fieldDefaults) {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container xs={12} spacing={2}>
          <Grid container xs={8} alignContent={'flex-start'}>
            <Box sx={{ width: '100%' }}>
              <Stack spacing={2}>
                <Paper sx={{ padding: 0 }}>
                  <Grid xs={12} container alignContent={'flex-start'} flexDirection={'column'}>
                    <PageContext.Provider value={{ fieldArrayName }}>
                      <FormProvider {...methods} >
                        <RenderedFields fieldsDefinition={allFieldsDefinition} control={control} fieldArrayName={`${fieldArrayName}.0`} />
                      </FormProvider>
                    </PageContext.Provider>
                  </Grid>
                </Paper>
              </Stack>
            </Box>
          </Grid>

          <Grid xs={4}>
            <Item>
              <TextField
                id="json-input"
                label="JSON"
                placeholder="{}"
                multiline
                fullWidth
                maxRows={38}
                value={allFieldsJson}
                onChange={handleJsonChanged}
              />
            </Item>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}
