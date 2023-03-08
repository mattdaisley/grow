'use client'

import { useRef, useState } from 'react';

import { v4 as uuidv4 } from 'uuid';
import logger from '../../../services/logger';

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
        // logger.log('useDynamic.handleSocketSuccess updated', updatedKey, updated[updatedKey])
        if (onChangeCallbacks?.current?.hasOwnProperty(updatedKey)) {
          const { onChangeCallback, timestamp } = onChangeCallbacks?.current[updatedKey]
          logger.log('useDynamic.handleSocketSuccess updated', updatedKey, updated[updatedKey], timestamp, Date.now(), timestamp < Date.now())
          if (timestamp < Date.now()) {
            onChangeCallback && onChangeCallback({ target: { value: updated[updatedKey] } }, updated[updatedKey])
          }
        }
      }
    })
  }

  function register(controllerName, onChangeCallback, timestamp) {
    if (onChangeCallbacks.current !== null) {
      onChangeCallbacks.current[controllerName] = { onChangeCallback, timestamp }
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