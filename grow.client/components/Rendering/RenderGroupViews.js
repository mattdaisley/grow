'use client'

import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';

import { RenderedFields } from './RenderedFields';

export function RenderGroupViews({ group, control, fieldArrayName }) {
  // console.log(fieldArrayName, group)
  return (
    <>
      <Grid container spacing={1} xs={12} sx={{ p: 1 }}>
        {group.views?.map((viewDefinition, index) => {
          if (!!viewDefinition) {
            // console.log(viewDefinition)
            return (
              <RenderedFields
                viewDefinition={viewDefinition}
                key={`${group.id}-${viewDefinition.id}-${index}`}
                control={control}
                fieldArrayName={fieldArrayName} />
            );
          }
        })}
      </Grid>
    </>
  );
}
