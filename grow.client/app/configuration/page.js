'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';

import { RenderField } from '../../components/RenderField';
import { getFieldDefault } from '../../components/getFieldDefault';
import { Item } from '../../components/Item';

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

const RenderedFields = ({ fieldsDefinition, control }) => {
  return <>
    {
      fieldsDefinition?.fields?.map(fieldDefinition => {
        return <RenderField field={fieldDefinition} key={`${fieldDefinition.id}`} control={control} />
      })
    }
  </>
}

export default function ComponentsPage() {

  const [allFieldsJson, setAllFieldsJson] = useState("");
  const [allFieldsDefinition, setAllFieldsDefinition] = useState();

  const [fieldDefaults, setFieldDefaults] = useState(undefined);

  const { register, control, handleSubmit, reset, formState, watch } = useForm();
  const { fields, append, remove } = useFieldArray({ name: 'testfrom', control });

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
      const { key, defaultValue } = getFieldDefault(fieldDefinition)
      fieldValues[key] = defaultValue;

    })

    reset({ 'testform': [fieldValues] });
    setFieldDefaults(fieldValues);

  }, [allFieldsJson])

  const handleJsonChanged = (event) => {
    const rawJson = event.target.value;
    setAllFieldsJson(rawJson);
    // console.log('setting local json', rawJson)
    localStorage.setItem('allfields', rawJson);

    try {
      var parsedJson = JSON.parse(rawJson);
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
        <Grid container spacing={2}>
          <Grid xs>
            <RenderedFields fieldsDefinition={allFieldsDefinition} control={control} />
          </Grid>
          <Grid xs={4}>
            <Item>
              <TextField
                id="json-input"
                label="JSON"
                placeholder="{}"
                multiline
                fullWidth
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
