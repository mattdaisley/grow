'use client';
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { flatten } from "flat";
import Box from "@mui/material/Box";
import Grid from '@mui/material/Unstable_Grid2';

import { DynamicItemContext as DynamicPageContext } from "./DynamicItemContext";

export function DynamicForm({ dynamicFormData, onSubmit, children, ...props }) {

  const [isFirstLoad, setIsFirstLoad] = useState(true);
  // console.log(dynamicFormData.fieldValues)
  const formMethods = useForm({ defaultValues: { ...dynamicFormData.fieldValues } });
  const fields = formMethods.watch();
  const { formState } = formMethods;
  // console.log(fields)

  useEffect(() => {
    // console.log('check to reset', !isFirstLoad, !formState.isSubmitting)
    if (!isFirstLoad && !formState.isSubmitting) {
      // console.log('resetting')
      formMethods.reset({ ...dynamicFormData.fieldValues });
    }

    setIsFirstLoad(false);
  }, [isFirstLoad, dynamicFormData.timestamp]);


  useEffect(() => {
    let timer;
    // console.log('formchange', formState.isDirty)
    if (formState.isDirty) {
      timer = setTimeout(() => {
        // console.log(flatten(formState.dirtyFields))
        formMethods.handleSubmit(onSubmit)();
      }, 1000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [formState.isDirty, JSON.stringify(fields)]);

  if (isFirstLoad) {
    return null;
  }

  return (
    <form onSubmit={formMethods.handleSubmit(onSubmit)}>
      <Box sx={{ flexGrow: 1, py: 4, pl: { xs: 2, md: 4 } }}>
        <Grid container xs={12} spacing={0}>
          <FormProvider {...formMethods}>
            <DynamicPageContext.Provider value={{ ...props }}>
              {children}
            </DynamicPageContext.Provider>
          </FormProvider>
        </Grid>
      </Box>
    </form>
  );
}
