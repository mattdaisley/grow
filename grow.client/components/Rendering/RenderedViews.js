'use client'

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

import { RenderGroupViews } from './RenderGroupViews';
import { RenderGroupCollectionTabs } from './RenderGroupCollectionTabs';
import { RenderGroupCollectionDataGrid } from './RenderGroupCollectionDataGrid';
import { RenderGroupCollectionAdd } from './RenderGroupCollectionAdd';

export const RenderedViews = ({ pageDefinition, control, fieldArrayName }) => {

  if (!pageDefinition) {
    return null;
  }
  // console.log(pageDefinition);
  return <Box sx={{ width: '100%' }}>
    <Stack spacing={2}>
      {pageDefinition?.groups?.map(group => {

        const renderGroup = () => {
          switch (group.type) {
            case 'collection-tabs':
              return (
                <RenderGroupCollectionTabs group={group} control={control} fieldArrayName={fieldArrayName} />
              )
            case 'collection-grid':
              return (
                <RenderGroupCollectionDataGrid group={group} control={control} fieldArrayName={fieldArrayName} />
              )
            case 'collection-add':
              return (
                <RenderGroupCollectionAdd group={group} control={control} fieldArrayName={fieldArrayName} />
              )
            default:
              return (
                <RenderGroupViews group={group} control={control} fieldArrayName={fieldArrayName} />
              )
          }
        }

        return (
          <Paper key={group.id}>
            {renderGroup()}
          </Paper>
        )

      })}
    </Stack>
  </Box>;
};


