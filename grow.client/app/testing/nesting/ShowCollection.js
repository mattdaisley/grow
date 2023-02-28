'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from "react";

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from "@mui/material/Box";
import { DataGrid } from '@mui/x-data-grid';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import logger from "../../../../grow.api/src/logger";
import { useSubscription } from "./useSubscription";
import { ShowItem } from "./ShowItems";
import { flatten } from 'flat';

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

  const collectionContextKey = `${props.contextKey}_collections_${collectionIds[0]}`

  const collectionProps = {
    contextKey: collectionContextKey,
    itemKey: 'collections',
    fieldKey: collectionIds[0],
    keyPrefix: `collections.${collectionIds[0]}`
  }

  const collectionType = props.valueKeys.get('type')

  return (
    <>
      {collectionType === '0' && (
        <CollectionWrapper pageProps={{ ...props }} collectionContextKey={collectionContextKey}>
          <CollectionTabs
            pageProps={{ ...props }}
            collectionProps={collectionProps} />
        </CollectionWrapper>
      )}

      {collectionType === '1' && (
        <CollectionWrapper pageProps={{ ...props }} collectionContextKey={collectionContextKey}>
          <CollectionGrid
            pageProps={{ ...props }}
            collectionProps={collectionProps} />
        </CollectionWrapper>
      )}

      {collectionType === '2' && (
        <CollectionWrapper pageProps={{ ...props }} collectionContextKey={collectionContextKey}>
          <CollectionAdd
            pageProps={{ ...props }}
            collectionProps={collectionProps} />
        </CollectionWrapper>
      )}
    </>
  );

}

function CollectionWrapper({ pageProps, collectionContextKey, children }) {

  logger.log('ShowCollectionTabs', 'collectionContextKey:', collectionContextKey);

  useEffect(() => {
    pageProps.itemsMethods.getItems([collectionContextKey, `${collectionContextKey}_drafts`, 'collections']);
  }, [collectionContextKey]);

  return useMemo(() => (
    <>{children}</>
  ), []);
}

function CollectionTabs({ pageProps, collectionProps }) {

  const keyPrefix = undefined;
  const collectionFields = useSubscription({ ...pageProps, itemKey: collectionProps.contextKey, keyPrefix: undefined });
  const label = useSubscription({ ...pageProps, itemKey: `${collectionProps.itemKey}.${collectionProps.fieldKey}`, keyPrefix, searchSuffix: 'label' });

  logger.log('CollectionTabs', 'collectionFields:', collectionFields, 'pageProps:', pageProps, 'collectionProps:', collectionProps);

  const handleCollectionAdd = () => {
    const itemKey = collectionProps.contextKey;
    const keyPrefix = collectionProps.contextKey;

    let propertiesToAdd = {
      type: pageProps.valueKeys.get('type')
    };

    const itemsToAdd = {
      [keyPrefix]: propertiesToAdd
    };

    logger.log('CollectionTabs collectionProps.addItems( itemKey:', itemKey, ', itemsToAdd:', itemsToAdd, ')');
    pageProps.itemsMethods.addItems(itemKey, itemsToAdd);
  };

  const handleCollectionRemove = (fieldKey) => {

    const itemKey = collectionProps.contextKey;

    logger.log('handleCollectionRemove collectionProps.deleteItems( itemKey:', itemKey, ', fieldKey:', fieldKey, ')', collectionProps);
    pageProps.itemsMethods.deleteItemsByFieldKey(itemKey, fieldKey)
  }

  return (
    <>
      <ControlledTabs
        fields={collectionFields}
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

  const fields = props.fields ?? new Map()
  const currentTab = (fields.size > tabState.currentTab) ? tabState.currentTab : fields.size - 1;

  const tabIds = []
  fields.forEach((_, fieldKey) => {
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
          maxWidth: { xs: `calc(100% - 85px)` }
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
              pageContextKey={pageProps.contextKey}
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



function CollectionGrid({ pageProps, collectionProps }) {
  const collectionFields = useSubscription({ ...pageProps, itemKey: collectionProps.contextKey, keyPrefix: undefined });
  // const fields = useSubscription({ ...pageProps, itemKey: undefined, searchSuffix: undefined });
  const _collectionsRef = useRef({})
  const [_, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  useEffect(() => {
    if (_collectionsRef.current !== undefined) {
      Object.keys(_collectionsRef.current).map(collectionContextKey => {
        pageProps.itemsMethods.getItems([collectionContextKey, 'collections']);
      })
    }
  })

  const grouplabel = pageProps.valueKeys.get('label')

  let columns = [{ field: 'id', headerName: 'id', flex: 1 }]
  const viewFieldColumns = getReferencedViewFieldColumns(pageProps, _collectionsRef, forceUpdate)
  if (viewFieldColumns.size !== 0) {
    viewFieldColumns.forEach((viewFieldColumn) => {
      columns.push(viewFieldColumn.columnDefinition)
    });
  }

  const rows = getCollectionRows(collectionFields, viewFieldColumns)

  logger.log('CollectionGrid', 'collectionFields:', collectionFields, 'valueKeys:', pageProps.valueKeys, 'columns:', columns, 'rows:', rows, 'pageProps:', pageProps, 'collectionProps:', collectionProps);

  let sortModel = [{ field: 'id', sort: 'desc' }]

  return (
    <>
      <Paper sx={{
        width: '100%',

      }}>
        <Typography variant='h6' sx={{ p: 1 }}>{grouplabel}</Typography>
        <DataGrid
          sortModel={sortModel}
          rows={rows ?? []}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20]}
          rowHeight={40}
          autoHeight
          sx={{ bgcolor: 'background.paper' }}
        />
      </Paper>

    </>
  )
}

function getReferencedViewFieldColumns(pageProps, _collectionsRef, forceUpdate) {
  logger.log('getReferencedViewFields', 'valueKeys:', pageProps.valueKeys, 'pageProps:', pageProps)

  const referencedViews = pageProps.valueKeys.get('views')

  const viewFieldIds = []
  const viewFields = new Map()

  if (referencedViews === undefined) {
    return viewFields
  }

  referencedViews.forEach((referencedView) => {

    const referencedViewId = referencedView.get('id')

    const view = pageProps.itemsMethods.getTreeMapItem(`views.${referencedViewId}`)

    if (view === undefined) {
      return;
    }

    // logger.log('getReferencedViewFields', 'view:', view)

    const groups = view.get('groups')
    groups.forEach((group) => {
      // logger.log('getReferencedViewFields', 'group:', group)

      const referencedFields = group.get('fields')

      if (referencedFields === undefined) {
        return;
      }

      referencedFields.forEach((referencedField) => {

        const referencedFieldId = referencedField.get('id')
        viewFieldIds.push(referencedFieldId)

        const fields = pageProps.itemsMethods.getTreeMapItem(`fields.${referencedFieldId}`)

        if (fields === undefined) {
          return;
        }
        // logger.log('getReferencedViewFields', 'fields:', fields, 'pageProps:', pageProps)

        const fieldName = fields.get('name')
        const headerName = fields.get('label') ?? fieldName

        let viewField = {
          columnDefinition: {
            field: fieldName, headerName, flex: 1
          }
        }

        const referencedCollection = fields.get('options-collection')
        const referencedLabelField = fields.get('options-label')
        if (referencedCollection !== undefined && referencedLabelField !== undefined) {
          const contextKey = pageProps.pageContextKey ?? pageProps.contextKey
          const collectionContextKey = `${contextKey}_collections_${(referencedCollection ?? '0')}`

          // pageProps.itemsMethods.getItems([collectionContextKey, 'collections']);
          _collectionsRef.current[collectionContextKey] = true;
          pageProps.itemsMethods.subscribeMap(collectionContextKey, forceUpdate);

          const referencedCollectionFields = pageProps.itemsMethods.getTreeMapItem(collectionContextKey)
          const labelField = pageProps.itemsMethods.getTreeMapItem(`fields.${referencedLabelField}`)

          // logger.log('getReferencedViewFields', 'referencedCollectionFields:', referencedCollectionFields, 'labelField:', labelField)
          viewField.referencedCollectionFields = referencedCollectionFields
          viewField.labelField = labelField
        }

        viewFields.set(viewField.columnDefinition.field, viewField)
      });
    });

  });

  // logger.log('getReferencedViewFields', 'viewFieldIds:', viewFieldIds, 'viewFields:', viewFields)
  return viewFields
}

function getCollectionRows(collectionFields, viewFieldColumns) {
  const rows = []

  if (collectionFields === undefined) {
    return rows;
  }

  logger.log('getCollectionRows', 'collectionFields:', collectionFields, 'viewFieldColumns:', viewFieldColumns)

  collectionFields.forEach((collectionField, collectionFieldKey) => {
    const row = { id: collectionFieldKey }
    collectionField.forEach((fieldValue, fieldKey) => {
      // logger.log('getCollectionRows', 'fieldValue:', fieldValue, 'fieldKey:', fieldKey, 'collectionFields:', collectionFields, 'viewFieldColumns:', viewFieldColumns)
      const column = viewFieldColumns.get(fieldKey)
      if (column === undefined || fieldValue === null) {
        row[fieldKey] = fieldValue ?? ""
      }
      else {
        const labelField = column.labelField
        const referencedCollectionFields = column.referencedCollectionFields
        // logger.log('getCollectionRows', 'fieldValue:', fieldValue, 'fieldKey:', fieldKey, 'labelField:', labelField, 'referencedCollectionFields:', referencedCollectionFields)

        if (labelField !== undefined && referencedCollectionFields !== undefined) {
          const referencedCollectionField = referencedCollectionFields.get(fieldValue)
          const referencedCollectionValue = referencedCollectionField.get(labelField.get('name'))
          row[fieldKey] = referencedCollectionValue
        }
        else {
          row[fieldKey] = fieldValue
        }
      }
    });

    rows.push(row)
  });

  return rows
}


function CollectionAdd({ pageProps, collectionProps }) {

  const draftCollectionContextKey = `${collectionProps.contextKey}_drafts`
  const collectionFields = useSubscription({ ...pageProps, itemKey: draftCollectionContextKey, keyPrefix: undefined });

  logger.log('CollectionAdd', 'collectionFields:', collectionFields, 'pageProps:', pageProps, 'collectionProps:', collectionProps);

  const handleCollectionAdd = () => {
    const draftValues = pageProps.itemsMethods.getNestedDataObject(draftCollectionContextKey)

    const itemKey = collectionProps.contextKey;

    const itemsToAdd = { [itemKey]: { ...draftValues } };

    logger.log('CollectionAdd collectionProps.addItems( itemKey:', itemKey, ', itemsToAdd:', itemsToAdd, ')');
    pageProps.itemsMethods.addItems(itemKey, itemsToAdd);

    const draftValuesFlattened = flatten(draftValues)
    const itemsToDelete = {}
    Object.keys(draftValuesFlattened).forEach(draftValueKey => {
      itemsToDelete[`${draftCollectionContextKey}.${draftValueKey}`] = draftValuesFlattened[draftValueKey]
    })
    logger.log('CollectionAdd collectionProps.deleteItems( itemKey:', draftCollectionContextKey, ', itemsToDelete:', itemsToDelete, ')');
    pageProps.itemsMethods.deleteItems(draftCollectionContextKey, itemsToDelete)
  };

  return (
    <>
      <Grid container spacing={1} xs={12} sx={{ py: 1, px: 2 }}>
        <ShowItem {...pageProps}
          pageContextKey={pageProps.contextKey}
          contextKey={draftCollectionContextKey}
          contextValueKeyPrefix={draftCollectionContextKey}
        />
      </Grid>
      <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'grey.300' }}>
        <Button onClick={handleCollectionAdd}>{'Add Item'}</Button>
      </Box>
    </>
  )
}