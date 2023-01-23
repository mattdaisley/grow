'use client'

import { useState } from 'react';
import { useFieldArray, useWatch } from "react-hook-form";

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Grid from '@mui/material/Unstable_Grid2';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { getCollectionFieldDefaults } from '../../services/getCollectionFieldDefaults';
import { RenderGroupViews } from './RenderGroupViews';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { value, index, group, control, fieldArrayName } = props;

  const collectionFieldArrayName = `${fieldArrayName}.${value}`;

  return <>
    {value === index && (
      <RenderGroupViews group={group} control={control} fieldArrayName={collectionFieldArrayName} />
    )}
  </>;
}

export function RenderCollectionGroupViews({ group, control, fieldArrayName }) {
  const [value, setValue] = useState(0);

  let collectionName = group.name ?? "collection";
  const collectionFieldArrayName = `${fieldArrayName}.${collectionName}`;

  const { fields, append, remove } = useFieldArray({
    control,
    name: collectionFieldArrayName
  });

  const watchFields = useWatch({
    control,
    name: collectionFieldArrayName
  });

  // console.log(collectionFieldArrayName, watchFields);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleCollectionAdd = (event) => {
    const newDefaults = getCollectionFieldDefaults(group);
    append(newDefaults.collection);
    setValue(fields.length);
  };

  const handleCollectionRemove = (event) => {
    if (fields.length > 1) {
      remove(value)

      if (value > 0) {
        setValue(value - 1);
      }
    }
  }

  return (
    <>
      <Grid container alignItems={'center'}>
        <Box sx={{
          px: 1,
          maxWidth: { xs: 'calc(100% * 11 / var(--Grid-columns))' }
        }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="scrollable"
            scrollButtons={false}>
            {watchFields.map((field, index) => {
              let label = !!group.label ? field[`${group.label}`] : "";
              if (label === undefined || label === "") {
                label = `${collectionName} ${index}`
              };
              // console.log(group, field, label === undefined, label === "");
              return (
                <Tab key={field.id} label={label} {...a11yProps(index)} />
              )
            })}
          </Tabs>
        </Box>
        <Box xs={1} >
          <IconButton onClick={handleCollectionRemove}><RemoveIcon /></IconButton>
          <IconButton onClick={handleCollectionAdd}><AddIcon /></IconButton>
        </Box>
      </Grid>
      {
        watchFields.map((field, index) => (
          <TabPanel key={field.id} value={value} index={index} group={group} control={control} fieldArrayName={collectionFieldArrayName} />
        ))
      }
    </>
  );
}
