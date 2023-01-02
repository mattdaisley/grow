import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import { DataGrid } from '@mui/x-data-grid';

import { RenderedFields, RenderedViews } from '../../components/RenderedFields';
import usePages from '../../../services/pages.service';
import useGardens from '../../../services/gardens.service';

export default function DynamicPage({ gardenId, pageId }) {

  const fieldArrayName = `garden-${gardenId}`;

  const { control, handleSubmit, reset, formState } = useForm();
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ name: fieldArrayName, control });
  const [formResults, setFormResults] = useState();

  const { currentGardenDefinition, currentGardenJson, currentGardenFieldDefaults, updateGarden } = useGardens(gardenId);
  const [currentPageId, setCurrentPageId] = useState();
  const { currentPageDefinition, currentPageJson, currentPageFieldDefaults, updatePage } = usePages(currentPageId);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!!currentGardenDefinition) {
      const matchingPage = currentGardenDefinition.pages.find(page => page.id === pageId)
      if (!!matchingPage) {
        // console.log(matchingPage);
        setCurrentPageId(matchingPage.id);
      }
    }

    if (!!currentGardenDefinition && !!currentPageDefinition && !!currentPageFieldDefaults) {
      setLoading(false);
      let currentPageFieldValues = { ...currentPageFieldDefaults };
      try {
        const savedFieldData = JSON.parse(localStorage.getItem(fieldArrayName));
        currentPageFieldValues = { ...currentPageFieldValues, ...savedFieldData }
      }
      catch (e) {
        console.log(e);
      }

      reset({ [fieldArrayName]: [currentPageFieldValues] });
    }

  }, [JSON.stringify(currentGardenDefinition), JSON.stringify(currentPageDefinition), JSON.stringify(currentPageFieldDefaults)])

  function onSubmit(data) {
    // display form data on success
    localStorage.setItem(fieldArrayName, JSON.stringify(data[fieldArrayName][0]));
    setFormResults(JSON.stringify(data, null, 4));
  }

  function resetForm() {
    setFormResults();
    reset();
  }

  // console.log(loading, "currentPageDefinition", currentPageDefinition, "currentPageFieldDefaults", currentPageFieldDefaults)

  if (loading) {
    return null;
  }

  return <div style={{ width: '100%', height: '100%' }}>
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid xs>
            <RenderedViews pageDefinition={currentPageDefinition} control={control} fieldArrayName={fieldArrayName} />
            <Grid xs={12}>
              <Button type="submit">Submit</Button>
              <Button onClick={resetForm}>Reset</Button>
            </Grid>
            <Grid xs>
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
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </form>
  </div>
}

export async function getServerSideProps({ params }) {
  // Fetch data from external API

  // Pass data to the page via props
  console.log(params)
  return { props: { gardenId: Number(params.dynamic[0]), pageId: Number(params.dynamic[1]) } }
}