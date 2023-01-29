'use client'

import { useEffect, useState } from 'react';
import { useFieldArray, useWatch } from "react-hook-form";

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Grid from '@mui/material/Unstable_Grid2';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { getCollectionFieldsAndDefaults } from '../../services/getCollectionFieldsAndDefaults';
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

export function RenderGroupCollectionTabs({ group, control, fieldArrayName }) {
  const [value, setValue] = useState(0);
  const [tabState, setTabState] = useState({ currentTab: 0 });

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

  // console.log(collectionFieldArrayName, watchFields)

  useEffect(() => {
    const newValue = fields.length - 1 >= tabState.currentTab ? tabState.currentTab : fields.length - 1;
    setValue(newValue);
  }, [tabState.currentTab, fields.length])

  // console.log(collectionFieldArrayName, watchFields);
  // console.log(group);

  const handleChange = (event, newValue) => {
    setTabState({ ...tabState, currentTab: newValue });
  };

  const handleCollectionAdd = (event) => {
    const newDefaults = getCollectionFieldsAndDefaults(group);
    append(newDefaults.fieldValues);
    setTabState({ ...tabState, currentTab: fields.length });
  };

  const handleCollectionRemove = (event) => {
    if (fields.length > 1) {
      // console.log(tabState, fields, fields)
      remove(tabState.currentTab)

      if (tabState.currentTab > 0) {
        setTabState({ ...tabState, currentTab: tabState.currentTab - 1 });
      }
    }
  }
  // console.log(tabState, fields, fields)

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
              // console.log(field)
              let label = !!group.label ? field[`${group.label}`] : "";
              if (label === undefined || label === "") {
                label = `${collectionName} ${index}`
              };

              return (
                <Tab key={index} label={label} {...a11yProps(index)} />
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
        fields.map((field, index) => (
          <TabPanel key={index} value={value} index={index} group={group} control={control} fieldArrayName={collectionFieldArrayName} />
        ))
      }
    </>
  );
}
