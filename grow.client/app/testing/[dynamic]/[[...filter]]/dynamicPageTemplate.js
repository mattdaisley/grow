'use client'

import Box from "@mui/material/Box";
import Grid from '@mui/material/Unstable_Grid2';

import { useItems } from "../../nesting/useItems";
import { ShowItems } from "../../nesting/ShowItems";
import logger from "../../../../services/logger";

export default function DynamicPageTemplate({ contextKey, filter, itemKeys, data }) {

  const itemsMethods = useItems(itemKeys, data);

  logger.log('TestingNestingPage', itemsMethods.itemKeys)

  if (itemsMethods.itemKeys.length === 0) {
    return null;
  }

  return (
    <Grid xs={12} container sx={{ width: '100%' }}>
      <Box sx={{ flexGrow: 1, py: 4, px: { xs: 0, md: 4 } }}>
        <Grid container spacing={4} xs={12} sx={{ width: '100%', mx: { xs: 0, md: -1 } }}>
          {/* <ShowItems contextKey={'preview'} contextValueKeyPrefix={'preview'} itemKey={'pages'} filter={'5ef5fa9b-e8aa-4d00-a500-7bd753d29e34'} itemsMethods={itemsMethods} /> */}
          {/* <ShowItems contextKey={'preview'} contextValueKeyPrefix={'preview'} itemKey={'pages'} filter={'635fb7cf-ab95-4ce1-a3aa-09bf3a708ac8'} itemsMethods={itemsMethods} /> */}
          <ShowItems contextKey={contextKey} contextValueKeyPrefix={contextKey} itemKey={'pages'} filter={filter} itemsMethods={itemsMethods} />
        </Grid>
      </Box>
    </Grid>
  )
}