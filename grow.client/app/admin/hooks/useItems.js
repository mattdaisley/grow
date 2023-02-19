
import { useEffect, useState, useCallback, useMemo, useContext } from "react";

import { flatten, unflatten } from "flat";
import merge from "lodash.merge"
import { SocketContext } from "../../SocketContext";
import logger from "../../../../grow.api/src/logger";

export default function useItems(key, options) {

  const socket = useContext(SocketContext);

  const [tempNewItems, setTempNewItems] = useState();
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tempNewItems !== undefined) {
        setItems(tempNewItems)
        setTempNewItems(undefined)
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [key, JSON.stringify(tempNewItems)])

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
    logger.log('useItems.processReceivedItems:', key, data);

    if (!data.hasOwnProperty(key)) {
      return;
    }

    let flattened = { ...cache.flattened }
    data[key].forEach(dataItem => {
      // logger.log('useItems.processReceivedItems dataItem:', dataItem)

      if (Boolean(dataItem.deleted) === true) {
        delete flattened[dataItem.valueKey]
      }
      else {
        const value = dataItem.value;
        flattened[dataItem.valueKey] = value
      }

    })

    logger.log('useItems.processReceivedItems flattened:', flattened);
    const item = unflatten(flattened, { object: true });
    logger.log('useItems.processReceivedItems item:', item);
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
      options?.onSuccess?.(newCache)
      setCache(newCache)
      logger.log('useItems.processReceivedItems setting cache', newCache)
    }
    else {
      logger.log('useItems.processReceivedItems json matches cache')
    }

  }

  function debouncedSetItems(newItems) {
    logger.log('debouncedSetItems', key, newItems)
    setTempNewItems(newItems)
  }

  function setItems(newItems) {

    logger.log('setItems', key, newItems)
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
    Object.keys(cache.flattened).forEach(itemKey => {
      if (!newFlattened.hasOwnProperty(itemKey)) {
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
    // socket.emit('delete-items', deleteItemsEvent);
    logger.log('emit socket delete-items:', deleteItemsEvent)
    // setCache && setCache({ ...cache, requestState: 'submitting' })
  }
}