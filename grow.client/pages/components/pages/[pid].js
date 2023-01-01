import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';

import { Item } from '../index';
import useView from '../../../services/views.service';
import { RenderedFields, RenderedViews } from '../RenderedFields';
import usePages from '../../../services/pages.service';

export default function PagePage({ pageId }) {

  const { control, handleSubmit, reset, formState } = useForm();
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ name: 'testfrom', control });

  const [formResults, setFormResults] = useState();

  const { currentPageDefinition, currentPageJson, currentPageFieldDefaults, updatePage } = usePages(pageId);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!!currentPageFieldDefaults) {
      console.log(currentPageFieldDefaults);
      reset({ ['testform']: [currentPageFieldDefaults] });
      setLoading(false);
    }

  }, [JSON.stringify(currentPageFieldDefaults)])

  const handleJsonChanged = (event) => {
    const rawJson = event.target.value;
    updatePage(rawJson);
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

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid xs>
              <RenderedViews pageDefinition={currentPageDefinition} control={control} />
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
                  value={currentPageJson}
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
  return { props: { pageId: Number(params.pid) } }
}