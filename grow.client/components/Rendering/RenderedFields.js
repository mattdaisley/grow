'use client'

import { useContext } from "react";
import { useForm, useFieldArray, useWatch, useFormContext } from "react-hook-form";

import Grid from '@mui/material/Unstable_Grid2';

import { RenderField } from './RenderField';
import { PageContext } from "../../app/PageContext";
import { getConditions } from "../../services/getConditions";

export const RenderedFields = ({ viewDefinition, fieldArrayName }) => {
  // console.log(viewDefinition);
  // console.log(fieldArrayName)
  const { control, watch } = useFormContext();
  const pageContext = useContext(PageContext);

  const pageFields = watch(fieldArrayName);
  // console.log(pageFields)

  if (!viewDefinition) {
    return null;
  }

  function getFields(group) {
    return group.fields?.map(fieldDefinition => {
      if (!!fieldDefinition) {
        const conditions = getConditions(fieldDefinition, pageFields);
        // console.log(conditions);
        if (!conditions.visible) {
          return null;
        }

        return <RenderField field={fieldDefinition} key={`${group.id}-${fieldDefinition.id}`} control={control} fieldArrayName={fieldArrayName} />;
      }
    }).filter(field => field !== null)
  }

  return viewDefinition?.groups?.map(group => {
    const fields = getFields(group);
    // console.log(fields);
    if (fields.length === 0) {
      return null;
    }

    return (
      <Grid xs={group.width ?? 12} key={group.id}>
        {fields}
      </Grid>
    );
  })

};
