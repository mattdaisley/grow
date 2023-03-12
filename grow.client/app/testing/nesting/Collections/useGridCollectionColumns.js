'use client';

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import debounce from 'lodash.debounce';

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

import logger from "../../../../services/logger";
import { useSubscription } from "../useSubscription";
import { ShowItem } from "../ShowItems";

export function useGridCollectionColumns(props) {

  const [nestedFields, setNestedFields] = useState(new Map());
  const [forcedState, updateState] = useState();
  const forceUpdate = useCallback((valueKey, value) => {
    logger.log('useGridCollectionColumns forceUpdate', 'valueKey:', valueKey, 'value:', value);
    updateState({})
  }, []);
  const [, updateColumnsState] = useState();
  const forceUpdateColumns = useCallback((valueKey, value) => {
    logger.log('useGridCollectionColumns forceUpdateColumns', 'valueKey:', valueKey, 'value:', value);
    updateColumnsState({})
  }, []);

  useEffect(() => {
    const { nestedFields: collectionNestedFields, subscriptions } = getNestedFields(props, forceUpdate, forceUpdateColumns, getColumnValues)

    setNestedFields(collectionNestedFields)

    logger.log('useGridCollectionColumns', 'collectionNestedFields:', collectionNestedFields, 'subscriptions:', subscriptions, 'props:', props)

    return () => {
      logger.log('useGridCollectionColumns useEffect cleanup', 'keyPrefix:', props.keyPrefix, 'subscriptions:', subscriptions, 'props:', props);
      subscriptions.forEach((callback, key) => {
        props.itemsMethods.unsubscribeMap(key, callback);
      })
    };
  }, [props.keyPrefix, forcedState, setNestedFields]);


  let columns = [{ field: 'id', headerName: 'id', flex: 1 }]
  nestedFields.forEach(nestedField => {
    const columnValues = nestedField()
    if (columnValues !== undefined) {
      columns.push({
        ...columnValues, flex: 1
      })
    }
  })
  return columns;
}

export function getNestedFields(props, forceUpdate, forceUpdateColumns, fieldFunc) {
  const callback = debounce(forceUpdate, 100)
  const columnCallback = debounce(forceUpdateColumns, 100)

  const nestedFields = new Map()
  const subscriptions = new Map()

  const viewsKey = `${props.keyPrefix}.views`
  const referencedViews = props.itemsMethods.getTreeMapItem(viewsKey)
  props.itemsMethods.subscribeMap(viewsKey, callback);
  subscriptions.set(viewsKey, callback)

  if (referencedViews === undefined) {
    return { nestedFields, subscriptions }
  }

  referencedViews.forEach((referencedView) => {

    const referencedViewId = referencedView.get('id')

    const referencedViewKey = `views.${referencedViewId}`
    const view = props.itemsMethods.getTreeMapItem(referencedViewKey)
    props.itemsMethods.subscribeMap(referencedViewKey, callback);
    subscriptions.set(referencedViewKey, callback)

    if (view === undefined) {
      return { nestedFields, subscriptions }
    }

    const groups = view.get('groups')
    groups.forEach((group) => {

      const referencedFields = group.get('fields')

      if (referencedFields === undefined) {
        return { nestedFields, subscriptions }
      }

      referencedFields.forEach((referencedField) => {

        const referencedFieldId = referencedField.get('id')

        const referencedFieldKey = `fields.${referencedFieldId}`
        props.itemsMethods.subscribeMap(referencedFieldKey, columnCallback);
        subscriptions.set(referencedFieldKey, columnCallback)

        nestedFields.set(referencedFieldId, fieldFunc(props, referencedFieldId))
      });
    });

  });

  return { nestedFields, subscriptions }

}

function getColumnValues(props, referencedFieldId) {

  return function () {
    const referencedViewField = props.itemsMethods.getTreeMapItem(`fields.${referencedFieldId}`)
    if (referencedViewField === undefined) {
      return
    }

    const fieldName = referencedViewField.get('name')
    const headerName = referencedViewField.get('label') ?? fieldName

    return {
      field: fieldName, headerName, renderCell: (params) => {
        return <MemoizedCollectionGridCellValue {...props} referencedFieldId={referencedFieldId} referencedViewField={referencedViewField} params={params} />
        // return useMemo(() => <CollectionGridCellValue {...props} referencedViewField={referencedViewField} params={params} />, [referencedFieldId, params.value])
        // return <CollectionGridCellValue {...props} referencedViewField={referencedViewField} params={params} />
      }
    }
  }
}

const MemoizedCollectionGridCellValue = memo(CollectionGridCellValue, (prevProps, nextProps) => {

  // logger.log('MemoizedCollectionGridCellValue', prevProps.referencedFieldId === nextProps.referencedFieldId, 'prevProps.referencedFieldId', prevProps.referencedFieldId, 'nextProps.referencedFieldId', nextProps.referencedFieldId, prevProps.params.value === nextProps.params.value, 'prevProps.params.value', prevProps.params.value, 'nextProps.params.value:', nextProps.params.value, 'nextProps:', nextProps);
  return prevProps.params.value === nextProps.params.value && prevProps.referencedFieldId === nextProps.referencedFieldId
});

function CollectionGridCellValue({ params, referencedViewField, ...props }) {

  const fieldName = referencedViewField.get('name')

  const fieldValue = params.row[fieldName]

  const referencedCollection = referencedViewField.get('options-collection')
  const referencedLabelField = referencedViewField.get('options-label')

  logger.log('CollectionGridCellValue', 'fieldName:', fieldName, 'fieldValue:', fieldValue, 'referencedViewField:', referencedViewField, 'params:', params);

  if (referencedCollection !== undefined && referencedLabelField !== undefined) {
    return <CollectionGridCellReferencedValue {...props} fieldName={fieldName} referencedCollection={referencedCollection} referencedLabelField={referencedLabelField} params={params} />
  }

  return <>{fieldValue}</>
}

function CollectionGridCellReferencedValue({ params, fieldName, referencedCollection, referencedLabelField, ...props }) {

  const fieldValue = params.row[fieldName]

  const contextKey = props.pageContextKey ?? props.contextKey

  const collectionFields = props.itemsMethods.getTreeMapItem(`collections.${referencedCollection}`)
  const collectionSource = collectionFields?.get('source')

  const collectionContextKey = collectionSource === '1' ? 'gpio-device' : `${contextKey}_collections_${referencedCollection}`

  useEffect(() => {
    if (collectionContextKey !== undefined) {
      props.itemsMethods.getItems([collectionContextKey]);
    }
  }, [collectionContextKey])

  const labelField = useSubscription({ ...props, itemKey: `fields.${referencedLabelField}`, keyPrefix: undefined })
  const referencedCollectionFields = useSubscription({ ...props, itemKey: collectionContextKey, keyPrefix: undefined })

  logger.log('CollectionGridCellReferencedValue', 'collectionFields:', collectionFields, 'collectionContextKey:', collectionContextKey, 'referencedCollectionFields:', referencedCollectionFields, 'labelField:', labelField)

  if (labelField !== undefined && referencedCollectionFields !== undefined && fieldValue !== undefined) {
    const referencedCollectionField = referencedCollectionFields.get(fieldValue.split('.')[1])
    if (referencedCollectionField !== undefined) {
      return <>{referencedCollectionField.get(labelField.get('name'))}</>
    }
  }
  return <></>
}
