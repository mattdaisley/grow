'use client'

import { Fragment } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';

import { RenderGroupViews } from './RenderGroupViews';
import { RenderGroupCollectionTabs } from './RenderGroupCollectionTabs';
import { RenderGroupCollectionDataGrid } from './RenderGroupCollectionDataGrid';
import { RenderGroupCollectionAdd } from './RenderGroupCollectionAdd';

export const RenderedViews = ({ pageDefinition, control, fieldArrayName }) => {

  if (!pageDefinition) {
    return null;
  }
  // console.log(pageDefinition);
  return <Grid container spacing={4} sx={{ width: '100%' }}>
    {pageDefinition?.groups?.map(group => {
      console.log(group.width)
      const renderGroup = () => {
        switch (group.type) {
          case 'collection-tabs':
            return (
              <Grid xs={group.width || 12} spacing={2}>
                <Paper sx={{ width: '100%' }}>
                  <RenderGroupCollectionTabs group={group} control={control} fieldArrayName={fieldArrayName} />
                </Paper>
              </Grid>
            )
          case 'collection-grid':
            return (
              <Grid xs={group.width || 12}>
                <RenderGroupCollectionDataGrid group={group} control={control} fieldArrayName={fieldArrayName} />
              </Grid>
            )
          case 'collection-add':
            return (
              <Grid xs={group.width || 12} spacing={0}>
                <Paper sx={{ width: '100%' }}>
                  <RenderGroupCollectionAdd group={group} control={control} fieldArrayName={fieldArrayName} />
                </Paper>
              </Grid>
            )
          default:
            return (
              <Grid xs={12} alignContent={'flex-start'}>
                <Paper sx={{ width: '100%' }}>
                  <RenderGroupViews group={group} control={control} fieldArrayName={fieldArrayName} />
                </Paper>
              </Grid>
            )
        }
      }

      return (
        <Fragment key={group.id}>
          {renderGroup()}
        </Fragment>
      )

    })}
  </Grid>;
};


