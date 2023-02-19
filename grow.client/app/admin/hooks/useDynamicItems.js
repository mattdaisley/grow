'use client'

import { useRef, useState } from 'react';

import { v4 as uuidv4 } from 'uuid';
import logger from '../../../../grow.api/src/logger';

import useItems from './useItems';

export default function useDynamicItems(key) {

  const onChangeCallbacks = useRef({});
  const [allItems, setAllDynamic] = useState();

  const dynamicItems = useItems(key, { onSuccess: handleSocketSuccess });

  function handleSocketSuccess(data, updated) {
    logger.log('useDynamic.handleSocketSuccess', key, data, updated, allItems?.flattened, onChangeCallbacks.current)
    if (Object.keys(data.item).length > 0) {
      setAllDynamic(data);
    }
    Object.keys(updated).map(updatedKey => {
      // console.log(useDynamic.handleSocketSuccess)
      if (allItems?.flattened !== undefined && updated[updatedKey] !== allItems.flattened[updatedKey]) {
        logger.log('useDynamic.handleSocketSuccess updated', updatedKey, updated[updatedKey])
        const onChangeCallback = onChangeCallbacks?.current[updatedKey]
        onChangeCallback && onChangeCallback({ target: { value: updated[updatedKey] } }, updated[updatedKey])
      }
    })
  }

  function register(controllerName, onChangeCallback) {
    if (onChangeCallbacks.current !== null) {
      onChangeCallbacks.current[controllerName] = onChangeCallback
    }
  }

  logger.log('useDynamic', key, allItems, dynamicItems);

  return {
    allItems,
    addItems: dynamicItems.addItems,
    setItems: dynamicItems.setItems,
    deleteItems: dynamicItems.deleteItems,
    register
  }
}