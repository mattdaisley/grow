import { useState, useEffect, ChangeEvent } from 'react';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { TextItem } from './TextItem';
import { AutocompleteItem } from './AutocompleteItem';
import { CheckboxItem } from './CheckboxItem';
import { SelectItem } from './SelectItem';

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

const RenderedFields = ({ fieldsDefinition }) => {
  return <>
    {
      fieldsDefinition?.fields?.map(field => {
        switch (field.type) {
          case 'text':
          case 'numeric':
            return <TextItem field={field} key={field.id} />
          case 'autocomplete':
            return <AutocompleteItem field={field} key={field.id} />
          case 'checkbox':
            return <CheckboxItem field={field} key={field.id} />
          case 'select':
            return <SelectItem field={field} key={field.id} />
          default:
            // Do nothing for an unsupported type
            break;
        }
      })
    }
  </>
}

export default function ComponentsPage() {

  const [json, setJson] = useState();
  const [fieldsDefinition, setFieldsDefinition] = useState();

  useEffect(() => {
    const localJson = localStorage.getItem('allfields');
    // console.log('localJson: ', localJson)
    if (localJson) {
      setJson(localJson);

      try {
        var parsedJson = JSON.parse(localJson);
        setFieldsDefinition(parsedJson);
      }
      catch (e) {
        console.log(e);
      }
    }
    else {

      setJson(initialJson);

      try {
        var parsedJson = JSON.parse(initialJson);
        setFieldsDefinition(parsedJson);
      }
      catch {

      }
    }
  }, []);

  const handleJsonChanged = (event) => {
    const rawJson = event.target.value;
    setJson(rawJson);
    // console.log('setting local json', rawJson)
    localStorage.setItem('allfields', rawJson);

    try {
      var parsedJson = JSON.parse(rawJson);
      setFieldsDefinition(parsedJson);
    }
    catch {

    }
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid xs>
            <RenderedFields fieldsDefinition={fieldsDefinition} />
          </Grid>
          <Grid xs={4}>
            <Item>
              <TextField
                id="json-input"
                label="JSON"
                placeholder="{}"
                multiline
                fullWidth
                value={json}
                onChange={handleJsonChanged}
              />
            </Item>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}
