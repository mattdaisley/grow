'use client'

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

import { RenderGroupViews } from './RenderGroupViews';
import { RenderCollectionGroupViews } from './RenderCollectionGroupViews';

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
            case 'collection':
              return (
                <RenderCollectionGroupViews key={group.id} group={group} control={control} fieldArrayName={fieldArrayName} />
              )

            default:
              return (
                <RenderGroupViews key={group.id} group={group} control={control} fieldArrayName={fieldArrayName} />
              )
          }
        }

        return (
          <Paper>
            {renderGroup()}
          </Paper>
        )

      })}
    </Stack>
  </Box>;
};


