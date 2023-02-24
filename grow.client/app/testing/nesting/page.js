'use client';

import { useMemo, useCallback } from "react";
import { FormProvider, useFormContext, useFieldArray, useWatch } from "react-hook-form";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Unstable_Grid2';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Toolbar from "@mui/material/Toolbar";

import logger from "../../../../grow.api/src/logger";
import { useItems } from "./useItems";
import { EditItems } from "./EditItems";
import { ShowItems } from "./ShowItems";

export default function TestingNestingPage() {

  const itemKeys = ['preview', 'pages', 'views', 'fields']

  const items = useItems(itemKeys);

  logger.log('TestingNestingPage', items)

  if (items.itemKeys.length === 0) {
    return null;
  }

  return (
    <Grid xs={12} container sx={{ width: '100%' }}>
      <Box sx={{ flexGrow: 1, py: 4, pl: { xs: 2, md: 4 } }}>
        <Grid container xs={12} spacing={0}>
          <Grid xs={8}>
            <Grid container spacing={4} xs={12} sx={{ width: '100%' }}>
              <ShowItems contextKey={'preview'} contextValueKeyPrefix={'preview'} itemKey={'pages'} {...items} />
            </Grid>
          </Grid>
          <Grid xs={4}>
            <Grid container spacing={0} xs={12} sx={{ width: '100%' }}>
              <Box sx={{ flexGrow: 1, pr: { xs: 2, md: 4 }, mt: -.5 }}>
                <Paper sx={{ width: '100%' }}>
                  <EditItems itemKey={'pages'} {...items} />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  )
}