'use client';

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Grid from '@mui/material/Unstable_Grid2';
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { DynamicItemContext as DynamicPageContext } from "./DynamicItemContext";
import { getDynamicFormDefaults as getDynamicFormData } from "./getDynamicFormDefaults";
import { DynamicFields } from "./DynamicFields";

export function DynamicForm(props) {

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const dynamicFormData = useMemo(() => getDynamicFormData(props), [
    props.dynamicItem.timestamp,
    props.allPages.timestamp,
    props.allViews.timestamp,
    props.allFields.timestamp
  ]);

  // const { currentPageDefinition, currentPageFieldDefaults } = usePages(props.pageId);
  // console.log(props.pageId, currentPageFieldDefaults)
  const formMethods = useForm(dynamicFormData.fieldValues);
  const { formState } = formMethods;

  useEffect(() => {
    if (!isFirstLoad) {
      formMethods.reset({ ...dynamicFormData.fieldValues });
    }

    setIsFirstLoad(false);
  }, [isFirstLoad, dynamicFormData.timestamp]);

  // console.log(dynamicFormData)
  // console.log(formState.isDirty, formState.dirtyFields)

  function onSubmit(data) {
    // display form data on success
    props.dynamicItem.setItem(data)
    // setFormResults(JSON.stringify(data, null, 4));
  }

  return (
    <>
      <AppBar position="sticky" color="paper" sx={{ top: 0, bottom: 'auto' }}>
        <Toolbar disableGutters sx={{ py: 2, px: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography variant="subtitle1">{props.dynamicItem.item.name} / {dynamicFormData.currentPage.name}</Typography>
          <Typography variant="subtitle2">Up to date as of {new Date(dynamicFormData.timestamp).toLocaleString('en-us')}</Typography>
        </Toolbar>
      </AppBar>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Box sx={{ flexGrow: 1, p: 4 }} >
          <Grid container xs={12} spacing={0}>
            <FormProvider {...formMethods}>
              <DynamicPageContext.Provider value={{ ...props }}>
                <DynamicFields currentPage={dynamicFormData.currentPage} />
              </DynamicPageContext.Provider>
            </FormProvider>
          </Grid>
        </Box>
      </form>
    </>
  );
}
