import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';

import { Item } from '../index';
import { RenderField } from '../RenderField';
import { getFieldDefault } from '../getFieldDefault';

const RenderedFields = ({ viewDefinition, fieldsDefinition, control }) => {
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
                  return <RenderField field={fieldDefinition} key={`${group.id}-${fieldDefinition.id}`} control={control} />
              })
            }
          </Grid>
        )
      })
    }
  </Grid>
}

export default function ViewPage({ viewId }) {

  const [allFieldsLoaded, setAllFieldsLoaded] = useState(false);
  const [allFieldsJson, setAllFieldsJson] = useState("");
  const [allFieldsDefinition, setAllFieldsDefinition] = useState();

  const [allViewsLoaded, setAllViewsLoaded] = useState(false);
  const [allViewsJson, setAllViewsJson] = useState("");
  const [allViewsDefinition, setAllViewsDefinition] = useState([]);

  const [currentViewJson, setCurrentViewJson] = useState(`{ "id": ${viewId} }`);
  const [currentViewDefinition, setCurrentViewDefinition] = useState({ id: viewId });

  const [currentViewFieldDefaults, setCurrentViewFieldDefaults] = useState(undefined);

  const { register, control, handleSubmit, reset, formState, watch } = useForm();
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ name: 'testfrom', control });

  const [formResults, setFormResults] = useState();

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
      setAllFieldsLoaded(true);
    }

    loadAllFields()

    const loadInterval = setInterval(loadAllFields, 1000);
    return () => clearInterval(loadInterval);
  }, [allFieldsJson]);

  useEffect(() => {
    const loadView = () => {
      const localAllViewsJson = localStorage.getItem('allviews');
      if (localAllViewsJson && localAllViewsJson !== allViewsJson) {

        setAllViewsJson(localAllViewsJson);
        try {
          var allFields = JSON.parse(localAllViewsJson);
          setAllViewsDefinition(allFields);

          const currentView = allFields?.views.find(x => x.id === viewId)
          if (currentView) {
            setCurrentViewJson(JSON.stringify(currentView, null, 2));
            setCurrentViewDefinition(currentView);
          }
        }
        catch (e) {
          console.log(e);
        }
      }
      setAllViewsLoaded(true)
    }

    loadView();

    const loadViewInterval = setInterval(loadView, 2000);

    return () => clearInterval(loadViewInterval);
  }, [allViewsJson]);

  useEffect(() => {
    if (allFieldsJson === "" || allViewsJson === "") {
      return;
    }

    let fieldValues = {};
    currentViewDefinition?.groups?.map(group => {
      group.fields?.map((field) => {
        const fieldDefinition = allFieldsDefinition?.fields.find(x => x.id === field.fieldId);
        const { key, defaultValue } = getFieldDefault(fieldDefinition)
        fieldValues[key] = defaultValue;
      })
    })
    reset({ ['testform']: [fieldValues] });
    setCurrentViewFieldDefaults(fieldValues);

  }, [allFieldsJson, currentViewJson])

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

  function onSubmit(data) {
    // display form data on success
    setFormResults(JSON.stringify(data, null, 4));
  }

  function resetForm() {
    setFormResults();
    reset();
  }

  // console.log("currentViewFieldDefaults", currentViewFieldDefaults)
  if (!currentViewFieldDefaults) {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid xs>
              <RenderedFields viewDefinition={currentViewDefinition} fieldsDefinition={allFieldsDefinition} control={control} />
              <Grid xs={12}>
                <Button type="submit">Submit</Button>
                <Button onClick={resetForm}>Reset</Button>
              </Grid>
              <Grid xs>
                <Item>
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
                </Item>
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

export async function getServerSideProps({ params }) {
  // Fetch data from external API

  // Pass data to the page via props
  return { props: { viewId: Number(params.pid) } }
}