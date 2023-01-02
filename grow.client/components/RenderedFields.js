import Grid from '@mui/material/Unstable_Grid2';

import { RenderField } from './RenderField';

export const RenderedViews = ({ pageDefinition, control, fieldArrayName }) => {

  if (!pageDefinition) {
    return null;
  }
  // console.log(pageDefinition);

  return <Grid container spacing={2}>
    {pageDefinition?.groups?.map(group => {
      return (
        <Grid xs={group.width ?? 12} key={group.id}>
          {group.views?.map(viewDefinition => {
            // console.log(viewDefinition)
            if (!!viewDefinition) {
              return <RenderedFields viewDefinition={viewDefinition} key={`${group.id}-${viewDefinition.id}`} control={control} fieldArrayName={fieldArrayName} />
            }
          })}

        </Grid>
      );
    })}
  </Grid>;
}

export const RenderedFields = ({ viewDefinition, control, fieldArrayName }) => {
  // console.log(viewDefinition);
  if (!viewDefinition) {
    return null;
  }
  return <Grid container spacing={2}>
    {viewDefinition?.groups?.map(group => {
      return (
        <Grid xs={group.width ?? 12} key={group.id}>
          {group.fields?.map(fieldDefinition => {
            if (!!fieldDefinition)
              return <RenderField field={fieldDefinition} key={`${group.id}-${fieldDefinition.id}`} control={control} fieldArrayName={fieldArrayName} />;
          })}
        </Grid>
      );
    })}
  </Grid>;
};
