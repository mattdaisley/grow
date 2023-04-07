'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from "react";

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from "@mui/material/Box";
import { GridActionsCellItem, DataGrid } from '@mui/x-data-grid';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { flatten } from 'flat';

import logger from "../../../services/logger";
import { useSubscription } from "./useSubscription";
import { ShowItem } from "./ShowItems";
import { useGridCollectionColumns } from "./Collections/useGridCollectionColumns";
import CollectionChart from "./Collections/CollectionChart";

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

  return (
    <>
      <ShowCollectionControl {...props} collectionId={collectionIds[0]} />
    </>
  )
}

function ShowCollectionControl(props) {

  const collectionFields = useSubscription({ ...props, itemKey: `collections.${props.collectionId}`, keyPrefix: undefined });

  if (collectionFields === undefined) {
    return null;
  }

  const collectionSource = collectionFields?.get('source')

  logger.log('ShowCollectionControl', 'collectionFields:', collectionFields, 'props:', props);

  const collectionContextKey = collectionSource === '1' ? 'gpio-device' : `${props.contextKey}_collections_${props.collectionId}`

  const collectionProps = {
    contextKey: collectionContextKey,
    itemKey: 'collections',
    fieldKey: props.collectionId,
    keyPrefix: `collections.${props.collectionId}`
  }

  const collectionType = props.valueKeys.get('type')

  return (
    <>
      {collectionType === '0' && (
        <CollectionWrapper pageProps={{ ...props }} collectionProps={collectionProps} collectionContextKey={collectionContextKey}>
          <CollectionTabs
            pageProps={{ ...props }}
            collectionProps={collectionProps} />
        </CollectionWrapper>
      )}

      {collectionType === '1' && (
        <CollectionWrapper pageProps={{ ...props }} collectionProps={collectionProps} collectionContextKey={collectionContextKey}>
          <CollectionGrid
            pageProps={{ ...props }}
            collectionProps={collectionProps} />
        </CollectionWrapper>
      )}

      {collectionType === '2' && (
        <CollectionWrapper pageProps={{ ...props }} collectionType={collectionType} collectionProps={collectionProps} collectionContextKey={collectionContextKey}>
          <CollectionAdd
            pageProps={{ ...props }}
            collectionProps={collectionProps} />
        </CollectionWrapper>
      )}

      {collectionType === '3' && (
        <CollectionWrapper pageProps={{ ...props }} collectionType={collectionType} collectionProps={collectionProps} collectionContextKey={collectionContextKey}>
          <CollectionChart
            pageProps={{ ...props }}
            collectionProps={collectionProps} />
        </CollectionWrapper>
      )}
    </>
  );
}

function CollectionWrapper({ pageProps, collectionType, collectionContextKey, children }) {

  useEffect(() => {
    const itemKeys = [collectionContextKey, 'collections']
    // only load drafts for CollectionAdd type
    if (collectionType === '2') {
      itemKeys.push(`${collectionContextKey}_drafts`)
    }
    pageProps.itemsMethods.getItems(itemKeys);
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

  const [sortModel, setSortModel] = useState([{ field: 'id', sort: 'desc' }]);
  const _collectionsRef = useRef({})
  const [_, updateState] = useState();
  const forceUpdate = useCallback((field) => {
    logger.log('CollectionGrid forceUpdate', field);
    updateState({})
  }, []);

  const collectionFields = useSubscription({ ...pageProps, itemKey: collectionProps.keyPrefix, keyPrefix: undefined });
  const contextCollectionFields = useSubscription({ ...pageProps, itemKey: collectionProps.contextKey, keyPrefix: undefined });
  // const contextCollectionFields = pageProps.itemsMethods.getTreeMapItem(collectionProps.contextKey);
  const sortOrderFieldId = useSubscription({ ...pageProps, itemKey: pageProps.keyPrefix, keyPrefix: undefined, searchSuffix: 'sort-order' });
  const sortOrderField = pageProps.itemsMethods.getTreeMapItem(`fields.${sortOrderFieldId}`)
  const sortOrder = sortOrderField?.get('name') ?? sortOrderFieldId ?? 'id'

  const collectionColumns = useGridCollectionColumns(pageProps)

  useEffect(() => {
    if (_collectionsRef.current !== undefined) {
      Object.keys(_collectionsRef.current).map(collectionContextKey => {
        // pageProps.itemsMethods.getItems([collectionContextKey, 'collections']);
      })
    }
  })

  useEffect(() => {
    setSortModel([{ field: sortOrder, sort: 'desc' }])
  }, [sortOrder])

  const handleSortModelChange = useCallback((sortModel) => {
    setSortModel([...sortModel]);
  }, []);

  const handleCollectionRemove = (fieldKey) => {

    const itemKey = collectionProps.contextKey;

    logger.log('handleCollectionRemove collectionProps.deleteItems( itemKey:', itemKey, ', fieldKey:', fieldKey, ')', collectionProps);
    pageProps.itemsMethods.deleteItemsByFieldKey(itemKey, fieldKey)
  }

  collectionColumns.push(getActionsColumn(handleCollectionRemove))

  const rows = useMemo(() => getCollectionRows(contextCollectionFields), [contextCollectionFields?.size])

  logger.log('CollectionGrid', 'collectionFields:', collectionFields, 'contextCollectionFields:', contextCollectionFields, 'contextCollectionFields?.size:', contextCollectionFields?.size, 'rows:', rows, 'sortOrder:', sortOrder, 'pageProps:', pageProps, 'collectionProps:', collectionProps);


  return (
    <>
      <Paper sx={{
        width: '100%',
        pb: 2, px: 2
      }}>
        <ShowCollectionLabel {...pageProps} />
        <DataGrid
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          rows={rows ?? []}
          columns={collectionColumns}
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

export function ShowCollectionLabel(pageProps) {
  const sectionLabel = useSubscription({ ...pageProps, itemKey: pageProps.keyPrefix, keyPrefix: undefined, searchSuffix: 'label' });

  logger.log('ShowCollectionLabel', 'sectionLabel:', sectionLabel, 'pageProps:', pageProps);

  if (sectionLabel === undefined || sectionLabel === "") {
    return null;
  }

  return (
    <Grid xs={12} sx={{ px: 1, py: 1 }}>
      {pageProps.contextKey === 'preview' && (
        <Typography variant="subtitle2">
          {pageProps.fieldKey}
        </Typography>
      )}
      <Typography variant="h6">
        {sectionLabel}
      </Typography>
    </Grid>
  );
}

function getReferencedViewFieldColumns(props, _collectionsRef, forceUpdate) {
  logger.log('getReferencedViewFieldColumns', 'valueKeys:', props.valueKeys, 'props:', props)

  const viewFields = new Map()

  const referencedViewFields = getReferencedViewFields(props)

  referencedViewFields.forEach((referencedViewField, fieldId) => {

    const fieldName = referencedViewField.get('name')
    // props.itemsMethods.subscribeMap(`fields.${fieldId}.name`, forceUpdate);
    const headerName = referencedViewField.get('label') ?? fieldName
    // props.itemsMethods.subscribeMap(`fields.${fieldId}.label`, forceUpdate);

    let viewField = {
      columnDefinition: {
        field: fieldName, headerName, flex: 1
      }
    }

    const referencedCollection = referencedViewField.get('options-collection')
    const referencedLabelField = referencedViewField.get('options-label')
    if (referencedCollection !== undefined && referencedLabelField !== undefined) {
      const contextKey = props.pageContextKey ?? props.contextKey
      const collectionContextKey = `${contextKey}_collections_${(referencedCollection ?? '0')}`

      // props.itemsMethods.getItems([collectionContextKey, 'collections']);
      _collectionsRef.current[collectionContextKey] = true;
      // props.itemsMethods.subscribeMap(collectionContextKey, forceUpdate);

      const referencedCollectionFields = props.itemsMethods.getTreeMapItem(collectionContextKey)
      const labelField = props.itemsMethods.getTreeMapItem(`fields.${referencedLabelField}`)

      // logger.log('getReferencedViewFields', 'referencedCollectionFields:', referencedCollectionFields, 'labelField:', labelField)
      viewField.referencedCollectionFields = referencedCollectionFields
      viewField.labelField = labelField
    }

    viewFields.set(viewField.columnDefinition.field, viewField)
  });

  // logger.log('getReferencedViewFieldColumns', 'viewFieldIds:', viewFieldIds, 'viewFields:', viewFields)
  return viewFields
}



export function getReferencedViewFields(props) {
  logger.log('getReferencedViewFields', 'props:', props)

  // const referencedViews = props.valueKeys.get('views')
  const referencedViews = props.itemsMethods.getTreeMapItem(`${props.keyPrefix}.views`)

  const viewFieldIds = []
  const viewFields = new Map()

  if (referencedViews === undefined) {
    return viewFields
  }

  referencedViews.forEach((referencedView) => {

    const referencedViewId = referencedView.get('id')

    const view = props.itemsMethods.getTreeMapItem(`views.${referencedViewId}`)

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

        // TODO: Figure out referenced external device fields
        const referencedFieldId = referencedField.get('id')
        viewFieldIds.push(referencedFieldId)

        const fields = props.itemsMethods.getTreeMapItem(`fields.${referencedFieldId}`)

        if (fields === undefined) {
          return;
        }
        // logger.log('getReferencedViewFields', 'fields:', fields, 'props:', props)

        viewFields.set(referencedFieldId, fields)
      });
    });

  });

  // logger.log('getReferencedViewFields', 'viewFieldIds:', viewFieldIds, 'viewFields:', viewFields)
  return viewFields
}

function getCollectionRows(contextCollectionFields) {
  const rows = []

  if (contextCollectionFields === undefined) {
    return rows;
  }

  logger.log('getCollectionRows', 'contextCollectionFields:', contextCollectionFields)

  contextCollectionFields.forEach((collectionField, collectionFieldKey) => {
    const row = { id: collectionFieldKey }
    collectionField.forEach((fieldValue, fieldKey) => {
      row[fieldKey] = fieldValue ?? ""
    });

    rows.push(row)
  });

  return rows
}

function getActionsColumn(handleCollectionRemove) {
  return {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 80,
    cellClassName: 'actions',
    getActions: ({ id }) => {

      return [
        <GridActionsCellItem
          icon={<DeleteOutlinedIcon />}
          label="Delete"
          onClick={() => handleCollectionRemove(id)}
          color="inherit"
        />,
      ];
    },
  }
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
      <Box sx={{ px: 2, py: 2, borderTop: 1, borderColor: 'grey.300' }}>
        <Button variant="outlined" color="secondary" size="small" onClick={handleCollectionAdd}>{'Add Item'}</Button>
      </Box>
    </>
  )
}