'use client';

import { useState, useEffect } from "react";

import AddIcon from '@mui/icons-material/Add';
import Box from "@mui/material/Box";
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import logger from "../../../../grow.api/src/logger";
import { useSubscription, ShowItem } from "./page";

export function ShowCollection({ ...props }) {
  logger.log('ShowCollectionTabs', 'props:', props);

  // const collectionIds = props.valueKeys.collections?.map(collection => collection.id)
  if (!props.valueKeys.hasOwnProperty('collections')) {
    return null;
  }

  const collectionIds = Object.keys(props.valueKeys.collections).map(key => props.valueKeys.collections[key].id);

  if (collectionIds.length === 0) {
    return null;
  }

  return (
    <>
      {props.valueKeys.type === '0' && (
        <ShowCollectionTabs
          pageProps={{ ...props }}
          collectionProps={{
            contextKey: `${props.contextKey}_collections_${collectionIds[0]}`,
            itemKey: 'collections',
            fieldKey: collectionIds[0],
            keyPrefix: `collections.${collectionIds[0]}`
          }} />
      )}
    </>
  );

}

function ShowCollectionTabs({ pageProps, collectionProps }) {

  logger.log('ShowCollectionTabs', 'pageProps:', pageProps, 'collectionProps:', collectionProps);

  useEffect(() => {
    pageProps.getItems([collectionProps.contextKey, 'collections']);
  });

  return (
    <CollectionTabs pageProps={pageProps} collectionProps={{ ...collectionProps }} />
  );
}

function CollectionTabs({ pageProps, collectionProps }) {

  const keyPrefix = undefined;
  const { name, fields } = useSubscription({ ...pageProps, itemKey: collectionProps.contextKey, keyPrefix: undefined });
  const { fields: collectionLabelFields } = useSubscription({ ...pageProps, itemKey: `${collectionProps.itemKey}.${collectionProps.fieldKey}`, keyPrefix, searchSuffix: 'label' });

  logger.log('CollectionTabs', 'name:', name, 'fields:', fields, 'collectionLabelFields:', collectionLabelFields, 'pageProps:', pageProps, 'collectionProps:', collectionProps);


  const handleCollectionAdd = () => {
    logger.log('CollectionTabs handleCollectionAdd');

    const itemKey = collectionProps.contextKey;
    const keyPrefix = collectionProps.contextKey;

    let propertiesToAdd = {
      type: pageProps.valueKeys.type
    };

    const itemsToAdd = {
      [keyPrefix]: propertiesToAdd
    };

    logger.log('CollectionTabs collectionProps.addItems( itemKey:', itemKey, ', itemsToAdd:', itemsToAdd, ')');
    pageProps.addItems(itemKey, itemsToAdd);
  };

  return (
    <>
      <ControlledTabs
        fields={fields}
        collectionLabelFields={collectionLabelFields}
        onCollectionAdd={handleCollectionAdd}
        pageProps={pageProps}
        collectionProps={collectionProps} />
    </>
  );
}

function ControlledTabs({ pageProps, collectionProps, ...props }) {

  const [tabState, setTabState] = useState({ currentTab: 0, tabToRemove: undefined });

  const handleTabChange = (event, newValue) => {
    setTabState({ ...tabState, currentTab: newValue });
  };

  const currentTab = (Object.keys(props.fields).length > tabState.currentTab) ? tabState.currentTab : Object.keys(props.fields).length - 1;

  return (
    <>
      <Grid container spacing={0} alignItems={'center'} sx={{ p: 1 }}>
        <Box sx={{
          px: 1,
          // maxWidth: { xs: `calc(100% * 11 / var(--Grid-columns))` }
          maxWidth: { xs: `calc(100% - 45px)` }
        }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="basic tabs example"
            variant="scrollable"
            scrollButtons={false}>
            {(Object.keys(props.fields))?.map((field, index) => {
              // console.log(field, group)
              let collectionName = props.collectionLabelFields?.label ?? "Collection";
              let label = `${collectionName} ${index + 1}`;

              return (
                <Tab key={index} label={label} />
              );
            })}
          </Tabs>
        </Box>
        <Box xs={1}>
          {/* <IconButton onClick={handleCollectionRemove}><RemoveIcon /></IconButton> */}
          <IconButton onClick={props.onCollectionAdd}><AddIcon /></IconButton>
        </Box>
        <Grid container spacing={1} xs={12} sx={{ pt: 1 }}>
          {Object.keys(props.fields)?.map((field, index) => (
            <TabPanel
              key={field}
              currentTab={currentTab}
              index={index}
              {...pageProps}
              contextKey={collectionProps.contextKey}
              contextValueKeyPrefix={`${collectionProps.contextKey}.${field}`} />
          ))}
        </Grid>
      </Grid>
    </>
  );
}

function TabPanel({ currentTab, index, ...props }) {
  // logger.log('TabPanel', 'currentTab:', currentTab, 'index:', index, 'props:', props)
  return <>
    {currentTab === index && (
      <Grid container spacing={1} xs={12} sx={{ py: 1, px: 2 }}>
        <ShowItem {...props} />
      </Grid>
    )}
  </>;
}
