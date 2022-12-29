import { useState, useEffect, forwardRef, ChangeEvent } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';

import { TextItem } from '../TextItem';
import { AutocompleteItem } from '../AutocompleteItem';
import { CheckboxItem } from '../CheckboxItem';
import { SelectItem } from '../SelectItem';
import { Item } from '../index';

const RenderField = ({ field }) => {
  // console.log(field);
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
}

const RenderedFields = ({ viewDefinition, fieldsDefinition }) => {
  if (!viewDefinition || !fieldsDefinition) {
    return null;
  }
  // console.log(viewDefinition, fieldsDefinition);
  return <Grid container spacing={2}>
    {
      viewDefinition?.groups?.map(group => {
        return (
          <Grid xs={group.width ?? 12} key={group.id}>
            {
              group.fields?.map(field => {
                const fieldDefinition = fieldsDefinition.fields.find(x => x.id === field.fieldId)
                // console.log(fieldDefinition, fieldsDefinition);
                if (!!fieldDefinition)
                  return <RenderField field={fieldDefinition} key={`${group.id}-${field.fieldId}`} />
              })
            }
          </Grid>
        )
      })
      /*
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
            })*/
    }
  </Grid>
}

export default function ViewPage({ viewId }) {

  const [allFieldsJson, setAllFieldsJson] = useState("");
  const [allFieldsDefinition, setAllFieldsDefinition] = useState();

  const [allViewsDefinition, setAllViewsDefinition] = useState([]);

  const [currentViewJson, setCurrentViewJson] = useState(`{ "id": ${viewId} }`);
  const [currentViewDefinition, setCurrentViewDefinition] = useState({ id: viewId });

  useEffect(() => {
    const loadAllFields = () => {
      const localAllFieldsJson = localStorage.getItem('allfields');
      if (localAllFieldsJson && localAllFieldsJson !== allFieldsJson) {
        // console.log('loading new allFieldsJson: ', allFieldsJson, localAllFieldsJson)
        setAllFieldsJson(localAllFieldsJson);
        try {
          var parsedJson = JSON.parse(localAllFieldsJson);
          setAllFieldsDefinition(parsedJson);
        }
        catch (e) {
          console.log(e);
        }
      }
    }

    loadAllFields()
    const loadInterval = setInterval(loadAllFields, 1000);
    return () => clearInterval(loadInterval);
  }, [allFieldsJson]);

  useEffect(() => {
    const loadView = () => {
      const localAllViewsJson = localStorage.getItem('allviews');
      // console.log('localAllViewsJson: ', localAllViewsJson)
      if (localAllViewsJson) {

        try {
          var parsedJson = JSON.parse(localAllViewsJson);
          setAllViewsDefinition(parsedJson);

          const currentView = parsedJson?.views.find(x => x.id === viewId)
          if (currentView) {
            setCurrentViewJson(JSON.stringify(currentView, null, 2));
            setCurrentViewDefinition(currentView);
          }
        }
        catch (e) {
          console.log(e);
        }
      }
    }

    loadView();

    const loadViewInterval = setInterval(loadView, 2000);

    return () => clearInterval(loadViewInterval);
  }, []);

  const handleJsonChanged = (event) => {
    const rawJson = event.target.value;
    setCurrentViewJson(rawJson);

    try {
      var parsedJson = JSON.parse(rawJson);
      setCurrentViewDefinition(parsedJson);

      const currentViewIndex = allViewsDefinition.views.findIndex(x => x?.id === viewId)
      // console.log(currentViewIndex, parsedJson);
      if (currentViewIndex > -1) {
        allViewsDefinition.views[currentViewIndex] = parsedJson;
      }
      else {
        if (!allViewsDefinition.views) {
          allViewsDefinition.views = []
        }

        allViewsDefinition.views.push(parsedJson);
      }

      localStorage.setItem('allviews', JSON.stringify(allViewsDefinition));
    }
    catch {

    }
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid xs>
            <RenderedFields viewDefinition={currentViewDefinition} fieldsDefinition={allFieldsDefinition} />
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
    </div>
  );
}

export async function getServerSideProps({ params }) {
  // Fetch data from external API

  // Pass data to the page via props
  return { props: { viewId: Number(params.pid) } }
}