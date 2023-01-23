'use client'

import Grid from '@mui/material/Unstable_Grid2';

import { RenderField } from './RenderField';

export const RenderedFields = ({ viewDefinition, control, fieldArrayName }) => {
  // console.log(viewDefinition);
  if (!viewDefinition) {
    return null;
  }
  return viewDefinition?.groups?.map(group => {
    return (
      <Grid xs={group.width ?? 12} key={group.id}>
        {group.fields?.map(fieldDefinition => {
          if (!!fieldDefinition)
            return <RenderField field={fieldDefinition} key={`${group.id}-${fieldDefinition.id}`} control={control} fieldArrayName={fieldArrayName} />;
        })}
      </Grid>
    );
  })

};
