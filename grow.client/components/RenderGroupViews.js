'use client'

import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';

import { RenderedFields } from './RenderedFields';

export function RenderGroupViews({ group, control, fieldArrayName }) {
  // console.log(fieldArrayName)
  return (
    <Grid xs={12} container alignContent={'flex-start'}>
      {group.views?.map(viewDefinition => {
        // console.log(viewDefinition)
        if (!!viewDefinition) {
          return (
            <RenderedFields
              viewDefinition={viewDefinition}
              key={`${group.id}-${viewDefinition.id}`}
              control={control}
              fieldArrayName={fieldArrayName} />
          );
        }
      })}

    </Grid>
  );
}
