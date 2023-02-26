'use client';

import { useState, useEffect, useCallback, useMemo } from "react";

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Box from "@mui/material/Box";
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import logger from "../../../../grow.api/src/logger";
import { useSubscription } from "./useSubscription";
import { ShowItem } from "./ShowItems";

export function ShowCollection({ ...props }) {
  logger.log('ShowCollection', 'props:', props);

  if (!props.valueKeys.has('collections')) {
    return null;
  }

  const collectionIds = []
  props.valueKeys.get('collections').forEach(collection => {
    collectionIds.push(collection.get('id'));
  });

  if (collectionIds.length === 0) {
    return null;
  }

  const collectionType = props.valueKeys.get('type')

  return (
    <>
      {collectionType === '0' && (
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
  const fields = useSubscription({ ...pageProps, itemKey: collectionProps.contextKey, keyPrefix: undefined });
  const label = useSubscription({ ...pageProps, itemKey: `${collectionProps.itemKey}.${collectionProps.fieldKey}`, keyPrefix, searchSuffix: 'label' });

  logger.log('CollectionTabs', 'name:', name, 'fields:', fields, 'pageProps:', pageProps, 'collectionProps:', collectionProps);

  if (fields === undefined) {
    return null;
  }

  const handleCollectionAdd = () => {
    logger.log('CollectionTabs handleCollectionAdd');

    const itemKey = collectionProps.contextKey;
    const keyPrefix = collectionProps.contextKey;

    let propertiesToAdd = {
      type: pageProps.valueKeys.get('type')
    };

    const itemsToAdd = {
      [keyPrefix]: propertiesToAdd
    };

    logger.log('CollectionTabs collectionProps.addItems( itemKey:', itemKey, ', itemsToAdd:', itemsToAdd, ')');
    pageProps.addItems(itemKey, itemsToAdd);
  };

  const handleCollectionRemove = (fieldKey) => {

    const itemKey = collectionProps.contextKey;

    logger.log('handleCollectionRemove collectionProps.deleteItems( itemKey:', itemKey, ', fieldKey:', fieldKey, ')', collectionProps);
    pageProps.deleteItemsByFieldKey(itemKey, fieldKey)
  }

  return (
    <>
      <ControlledTabs
        fields={fields}
        label={label}
        onCollectionAdd={handleCollectionAdd}
        onCollectionRemove={handleCollectionRemove}
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

  const currentTab = (props.fields.size > tabState.currentTab) ? tabState.currentTab : props.fields.size - 1;

  const tabIds = []
  props.fields.forEach((values, fieldKey) => {
    tabIds.push(fieldKey);
  });

  const handleCollectionRemove = () => {
    props.onCollectionRemove(tabIds[currentTab])
  }

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
            {tabIds.map((field, index) => {
              // console.log(field, group)
              let collectionName = props?.label ?? "Collection";
              let label = `${collectionName} ${index + 1}`;

              return (
                <Tab key={field} label={label} />
              );
            })}
          </Tabs>
        </Box>
        <Box xs={1}>
          <IconButton onClick={handleCollectionRemove}><RemoveIcon /></IconButton>
          <IconButton onClick={props.onCollectionAdd}><AddIcon /></IconButton>
        </Box>
        <Grid container spacing={1} xs={12} sx={{ pt: 1 }}>
          {tabIds.map((field, index) => (
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
  logger.log('TabPanel', 'currentTab:', currentTab, 'index:', index, 'props:', props)
  const memoItems = useMemo(() => {
    return (
      <ShowItem {...props} />
    )
  }, [])

  return (
    <>
      <Grid container spacing={1} xs={12} sx={{ py: 1, px: 1.5, display: (currentTab === index ? 'flex' : 'none') }}>
        {memoItems}
      </Grid>
    </>
  )
}
