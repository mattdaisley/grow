'use client'

import { useContext } from "react";
import { useForm, useFieldArray, useWatch, useFormContext } from "react-hook-form";

import Grid from '@mui/material/Unstable_Grid2';
import { Typography } from "@mui/material";

import { RenderField } from './RenderField';
import { getConditions } from "../../services/getConditions";

export const RenderedFields = ({ viewDefinition, control, fieldArrayName }) => {
  // console.log(viewDefinition);
  const { watch } = useFormContext();

  const pageFields = watch(fieldArrayName);

  if (!viewDefinition) {
    return null;
  }

  function getFields(group) {
    // console.log(group, pageFields)
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

  if (viewDefinition?.groups === undefined) {
    return null;
  }

  const groupFields = viewDefinition?.groups?.map(group => {
    const fields = getFields(group);
    // console.log(fields);
    if (fields.length === 0) {
      return null;
    }

    return { group, fields };
  }).filter(groupField => groupField !== null);

  // console.log(groupFields)

  if (groupFields.length === 0) {
    return null;
  }

  return <>
    {viewDefinition.label && (
      <Grid xs={12}>
        <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'grey.300', px: 1 }}>{viewDefinition.label}</Typography>
      </Grid>
    )}
    {groupFields.map(({ group, fields }) => {

      return (
        <Grid xs={group.width ?? 12} key={group.id}>
          {fields}
        </Grid>
      );
    })}
  </>

};
