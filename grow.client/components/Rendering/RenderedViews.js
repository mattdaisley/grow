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
  return <Stack spacing={4} sx={{ width: '100%' }}>
    {pageDefinition?.groups?.map(group => {

      const renderGroup = () => {
        switch (group.type) {
          case 'collection-tabs':
            return (
              <Paper sx={{ width: '100%' }}>
                <RenderGroupCollectionTabs group={group} control={control} fieldArrayName={fieldArrayName} />
              </Paper>
            )
          case 'collection-grid':
            return (
              <RenderGroupCollectionDataGrid group={group} control={control} fieldArrayName={fieldArrayName} />
            )
          case 'collection-add':
            return (
              <Paper sx={{ width: '100%' }}>
                <RenderGroupCollectionAdd group={group} control={control} fieldArrayName={fieldArrayName} />
              </Paper>
            )
          default:
            return (
              <Paper sx={{ width: '100%' }}>
                <RenderGroupViews group={group} control={control} fieldArrayName={fieldArrayName} />
              </Paper>
            )
        }
      }

      return (
        <Fragment key={group.id}>
          {renderGroup()}
        </Fragment>
      )

    })}
  </Stack >;
};


