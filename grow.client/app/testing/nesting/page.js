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

import logger from "../../../services/logger";
import { useItems } from "./useItems";
import { EditItems } from "./EditItems/EditItems";
import { ShowItems } from "./ShowItems";

const editDrawerWidth = 450;

export default function TestingNestingPage() {

  const itemKeys = ['preview', 'pages', 'views', 'fields', 'collections']
  // const itemKeys = ['pages']

  const itemsMethods = useItems(itemKeys);

  console.log('TestingNestingPage', itemsMethods)

  if (itemsMethods.itemKeys.length === 0) {
    return null;
  }

  return (
    <Grid xs={12} container sx={{ width: '100%' }}>
      <Box sx={{ flexGrow: 1, py: 4, pl: { xs: 2, md: 4 }, pr: `${editDrawerWidth}px` }}>
        <Grid container spacing={4} xs={12} sx={{ width: '100%' }}>
          {/* <ShowItems contextKey={'preview'} contextValueKeyPrefix={'preview'} itemKey={'pages'} filter={'5ef5fa9b-e8aa-4d00-a500-7bd753d29e34'} itemsMethods={itemsMethods} /> */}
          {/* <ShowItems contextKey={'preview'} contextValueKeyPrefix={'preview'} itemKey={'pages'} filter={'635fb7cf-ab95-4ce1-a3aa-09bf3a708ac8'} itemsMethods={itemsMethods} /> */}
          <ShowItems contextKey={'preview'} contextValueKeyPrefix={'preview'} itemKey={'pages'} itemsMethods={itemsMethods} />
        </Grid>
      </Box>
      <Box sx={{ position: 'fixed', top: 0, right: 0, width: `${editDrawerWidth}px`, height: '100%', pt: '100px', overflowY: 'scroll' }}>
        <Box sx={{ flexGrow: 1, pr: { xs: 2, md: 4 }, mt: -.5 }}>
          <Paper sx={{ width: '100%' }}>
            <EditItems contextKey={'pages'} itemKey={'pages'} itemsMethods={itemsMethods} />
          </Paper>
        </Box>
        <Box sx={{ flexGrow: 1, pr: { xs: 2, md: 4 }, mt: 2 }}>
          <Paper sx={{ width: '100%' }}>
            <EditItems contextKey={'collections'} itemKey={'collections'} itemsMethods={itemsMethods} />
          </Paper>
        </Box>
      </Box>
    </Grid>
  )
}