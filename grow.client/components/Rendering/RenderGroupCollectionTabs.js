'use client'

import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from "react-hook-form";

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
  const [tabState, setTabState] = useState({ currentTab: 0, tabToRemove: undefined });

  let collectionName = group.name ?? "collection";
  const collectionFieldArrayName = `${fieldArrayName}.${collectionName}`;

  const formMethods = useFormContext();
  // const fields = formMethods.watch();

  const { fields, append, remove } = useFieldArray({
    control: formMethods.control,
    name: collectionName
  });

  const watchFields = formMethods.watch(collectionName);

  // console.log(collectionName, formMethods, watchFields)
  // console.log(collectionFieldArrayName, watchFields);
  // console.log(group);

  const handleChange = (event, newValue) => {
    setTabState({ ...tabState, currentTab: newValue });
  };

  const handleCollectionAdd = (event) => {
    const newDefaults = getCollectionFieldsAndDefaults(group);
    append(newDefaults.fieldValues);
    setTabState({ ...tabState, currentTab: watchFields?.length });
  };

  const handleCollectionRemove = (event) => {
    if (watchFields.length > 1 && tabState.currentTab > 0) {
      setTabState({ ...tabState, currentTab: tabState.currentTab - 1, tabToRemove: tabState.currentTab });
    }
  }

  useEffect(() => {
    // console.log(tabState, fields, fields)
    if (tabState.tabToRemove !== undefined) {
      remove(tabState.tabToRemove)
      setTabState({ ...tabState, tabToRemove: undefined });
    }

  }, [tabState.tabToRemove])

  // console.log(tabState, fields, fields)
  if (fields === undefined || watchFields === undefined) {
    return null;
  }

  const currentTab = (fields.length > tabState.currentTab) ? tabState.currentTab : fields.length - 1

  return (
    <>
      <Grid container spacing={0} alignItems={'center'} sx={{ p: 1 }}>
        <Box sx={{
          px: 1,
          maxWidth: { xs: 'calc(100% * 11 / var(--Grid-columns))' }
        }}>
          <Tabs
            value={currentTab}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="scrollable"
            scrollButtons={false}>
            {watchFields?.map((field, index) => {
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
        <Box xs={1}>
          <IconButton onClick={handleCollectionRemove}><RemoveIcon /></IconButton>
          <IconButton onClick={handleCollectionAdd}><AddIcon /></IconButton>
        </Box>
        <Grid container spacing={1} xs={12} sx={{ pt: 2 }}>
          {
            fields?.map((field, index) => (
              <TabPanel key={index} value={currentTab} index={index} group={group} control={control} fieldArrayName={collectionName} />
            ))
          }
        </Grid>
      </Grid>
    </>
  );
}
