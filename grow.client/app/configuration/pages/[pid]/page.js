'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, FormProvider, useContext } from "react-hook-form";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';

import { Item } from "../../fields/Item";
import { RenderedViews } from "../../../../components/Rendering/RenderedViews";
import usePages from '../../../../services/pages.service';
import { PageContext } from '../../../PageContext';

export default function PagePage({ params }) {

  const pageId = Number(params.pid)

  const fieldArrayName = `test-page-${pageId}`;

  const methods = useForm();
  const { control, handleSubmit, reset, formState, watch } = methods;

  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ name: fieldArrayName, control });

  const [formResults, setFormResults] = useState();

  const { currentPageDefinition, currentPageJson, currentPageFieldDefaults, updatePage } = usePages(pageId);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!!currentPageFieldDefaults) {
      // console.log(fieldArrayName, currentPageFieldDefaults);
      reset({ [fieldArrayName]: [currentPageFieldDefaults] });
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
          <Grid container xs={12} spacing={2}>
            <Grid container xs={8}>
              <PageContext.Provider value={{ fieldArrayName: `${fieldArrayName}.0` }}>
                <FormProvider {...methods} >
                  <RenderedViews pageDefinition={currentPageDefinition} control={control} fieldArrayName={`${fieldArrayName}.0`} />
                </FormProvider>
              </PageContext.Provider>

              <Grid xs={12}>
                <Button type="submit">Submit</Button>
                <Button onClick={resetForm}>Reset</Button>
              </Grid>

              <Grid xs={12}>
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
                  id="json-results"
                  label="JSON"
                  placeholder="{}"
                  multiline
                  fullWidth
                  maxRows={38}
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