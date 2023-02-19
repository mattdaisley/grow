
import { useEffect, useState, useCallback, useMemo, useContext, useRef } from "react";

import { flatten, unflatten } from "flat";
import merge from "lodash.merge"
import { SocketContext } from "../../SocketContext";
import logger from "../../../../grow.api/src/logger";
import debounce from "lodash.debounce";
import isEqual from "lodash.isequal";

export default function useItems(key, options) {

  const socket = useContext(SocketContext);

  const debouncedItemsToSet = useRef(null);
  const [tempReceivedItems, setTempReceivedItems] = useState();
  const [cache, setStateCache] = useState({ requestState: "loading", json: "", item: undefined, flattened: undefined, timestamp: Date.now() })

  useEffect(() => {
    function loadItems() {
      const data = { itemKey: key };
      socket?.emit('get-items', data)
      logger.log('useItems socket emit get-items', data)
    }

    const timeout = setTimeout(loadItems, 200)

    return () => clearTimeout(timeout);
  }, [key, socket])

  useEffect(() => {
    socket?.on(`items-${key}`, handleReceiveAllItems)
    // socket?.on('item-set', handleItemSet)
    // socket?.on('item-deleted', handleItemDeleted)
    // socket.emit('all-items', { [key]: {} })

    return () => {
      socket?.off(`items-${key}`, handleReceiveAllItems)
      // socket?.off('item-set', handleItemSet);
      // socket?.off('item-deleted', handleItemDeleted)
    };
  }, [key, socket, handleReceiveAllItems, cache.json])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tempReceivedItems !== undefined) {
        processReceivedItems(tempReceivedItems)
        setTempReceivedItems(undefined)
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [key, JSON.stringify(tempReceivedItems)])

  const setCache = useCallback((newState) => {
    logger.log('useItems.setCache:', key, newState)
    setStateCache(newState);
  }, [key, options.onSuccess, setStateCache])


  function handleReceiveAllItems(data) {
    if (tempReceivedItems === null) {
      logger.log('socket handleReceiveAllItems', data)
      setTempReceivedItems(data)
    }
    else {
      const newData = merge(tempReceivedItems, data)
      logger.log('socket handleReceiveAllItems', data, newData)
      setTempReceivedItems(newData);
    }
  }

  function processReceivedItems(data) {
    logger.log('socket processReceivedItems:', key, data);

    if (!data.hasOwnProperty(key)) {
      return;
    }

    let updated = {}
    let flattened = { ...cache.flattened }
    data[key].forEach(dataItem => {
      logger.log('socket processReceivedItems dataItem:', dataItem)

      if (Boolean(dataItem.deleted) === true) {
        delete flattened[dataItem.valueKey]
      }
      else {
        const value = dataItem.value;
        flattened[dataItem.valueKey] = value
        updated[dataItem.valueKey] = value
      }

    })

    logger.log('socket processReceivedItems flattened:', flattened);
    const item = unflatten(flattened, { object: true });
    logger.log('socket processReceivedItems item:', item);
    const json = JSON.stringify(item, null, 2);

    if (json !== cache.json) {
      const newCache = {
        ...cache,
        requestState: 'success',
        item,
        json,
        flattened,
        timestamp: Date.now()
      }
      options?.onSuccess?.(newCache, updated)
      setCache(newCache)
      logger.log('socket processReceivedItems setting cache', newCache, updated)
    }
    else {
      logger.log('socket processReceivedItems json matches cache')
    }

  }


  const debouncedEventHandler = useMemo(() => {
    // logger.log('debouncedSetItems debouncedEventHandler memo run')
    return debounce(setItems, 300)
  }, [key, socket, setCache, cache]);

  function debouncedSetItems(data) {
    let newData;
    if (debouncedItemsToSet.current === null) {
      newData = data;
    }
    else {
      newData = merge(debouncedItemsToSet.current, data)
    }
    logger.log('debouncedSetItems debouncedItemsToSet', key, newData)
    debouncedItemsToSet.current = newData;
    debouncedEventHandler(newData)
  }

  function setItems(newItems) {
    logger.log('setItems', key, newItems)

    if (!isEqual(debouncedItemsToSet.current, newItems)) {
      logger.log('setItems debouncedItemsToSet not equal to newItems', key, debouncedItemsToSet.current, newItems)
      //alert('debouncedItemsToSet not equal to newItems')
      return;
    }
    // else {
    logger.log('setItems debouncedItemsToSet to null', key, debouncedItemsToSet.current)
    debouncedItemsToSet.current = null;
    // }

    if (typeof newItems === 'string') {
      setItemsAsJson(newItems)
    }
    else {
      setItemsAsObject(newItems)
    }
  }

  function setItemsAsJson(newItems) {

    if (newItems === cache.json) {
      logger.log('setItemsAsJson: json = cache.json, returning')
      return;
    }

    try {
      const parsedItems = JSON.parse(newItems);
      setItemsAsObject(parsedItems)
    }
    catch (e) {
      if (e instanceof SyntaxError) {
        // SyntaxErrors are expected and can be ignored
      } else {
        logger.log(e)
      }
    }
  }

  function setItemsAsObject(newItems) {

    try {
      var newFlattened = flatten(newItems);
      // logger.log(newFlattened, cache.flattened);

      var dirtyItems = getDirtyItems(newFlattened, cache);
      if (Object.keys(dirtyItems).length > 0) {
        logger.log('setItemsAsObject dirtyItems:', key, dirtyItems)
        const setItemsEvent = { itemKey: key, values: { ...dirtyItems } }
        socket.emit('set-items', setItemsEvent)
        logger.log('setItemsAsObject socket emit set-item:', key, setItemsEvent)
      }
      // logger.log(dirty);

      var deletedItems = getDeletedItems(cache, newFlattened, socket, key);
      deleteItems(deletedItems, key, socket)

      if (Object.keys(dirtyItems).length > 0 || Object.keys(deletedItems).length > 0) {
        logger.log('setItemsAsObject: submitting', key, cache)
        setCache({ ...cache, requestState: 'submitting' })
      }
      else {
        logger.log(key, 'setItemsAsObject: no dirty or deleted items')
      }
    }
    catch (e) {
      logger.log(e)
    }
  }

  // const debouncedEventHandler = useMemo(
  //   () => debounce(setItems, 500)
  //   , [key, socket, setCache, cache]);

  return {
    setItems: useCallback((newItems) => debouncedSetItems(newItems), [key, socket, setCache, cache]),
    addItems: useCallback((addedItems) => addItems(addedItems, key, socket, setCache, cache), [key, socket, setCache, cache]),
    deleteItems: useCallback((deletedItems) => deleteItems(deletedItems, key, socket, setCache, cache), [key, socket, setCache, cache])
  }
}

function getDirtyItems(newFlattened, cache) {

  var dirty = {};
  Object.keys(newFlattened).forEach(itemKey => {
    if (!cache?.flattened
      || !cache.flattened.hasOwnProperty(itemKey)
      || newFlattened[itemKey] !== cache.flattened[itemKey]) {
      if (Array.isArray(newFlattened[itemKey]) && newFlattened[itemKey].length == 0) {
        return;
      }
      dirty[itemKey] = newFlattened[itemKey];
    }
  });
  return dirty;
}

function getDeletedItems(cache, newFlattened, socket, key) {
  logger.log('getDeletedItems', cache?.flattened, newFlattened)
  var deleted = {};
  if (cache?.flattened !== undefined) {
    Object.keys(newFlattened).forEach(itemKey => {
      if (!cache.flattened.hasOwnProperty(itemKey)) {
        deleted[itemKey] = cache.flattened[itemKey];
      }
    });
    // logger.log(deleted);
  }
  return deleted;
}


function addItems(addedItems, key, socket, setCache, cache) {
  if (Object.keys(addedItems).length > 0) {
    // const { prefix, suffix, value } = addedItems
    const addItemsEvent = { itemKey: key, items: addedItems }
    socket.emit('add-items', addItemsEvent)
    logger.log('addItems socket emit add-items:', addItemsEvent)
    setCache && setCache({ ...cache, requestState: 'submitting' })
  }
}

function deleteItems(deletedItems, key, socket, setCache, cache) {
  if (Object.keys(deletedItems).length > 0) {
    logger.log('deletedItems:', deletedItems)
    const deleteItemsEvent = { itemKey: key, items: { ...deletedItems } }
    socket.emit('delete-items', deleteItemsEvent);
    logger.log('emit socket delete-items:', deleteItemsEvent)
    // setCache && setCache({ ...cache, requestState: 'submitting' })
  }
}