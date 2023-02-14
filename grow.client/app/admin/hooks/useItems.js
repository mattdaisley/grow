
import { useEffect, useState, useCallback, useMemo, useContext } from "react";

import { flatten, unflatten } from "flat";
import merge from "lodash.merge"
import { SocketContext } from "../../SocketContext";

export default function useItems(key, options) {

  const socket = useContext(SocketContext);

  const [tempNewItems, setTempNewItems] = useState();
  const [tempReceivedItems, setTempReceivedItems] = useState();
  const [cache, setStateCache] = useState({ requestState: "loading", json: "", item: undefined, flattened: undefined, timestamp: Date.now() })

  useEffect(() => {
    function loadItems() {
      const data = { itemKey: key };
      socket?.emit('get-items', data)
      console.log('useItems emit get-items', data)
    }

    const timeout = setTimeout(loadItems, 200)

    return () => clearTimeout(timeout);
  }, [key, socket])

  useEffect(() => {
    socket?.on(`items-${key}`, handleRecieveAllItems)
    // socket?.on('item-set', handleItemSet)
    // socket?.on('item-deleted', handleItemDeleted)
    // socket.emit('all-items', { [key]: {} })

    return () => {
      socket?.off(`items-${key}`, handleRecieveAllItems)
      // socket?.off('item-set', handleItemSet);
      // socket?.off('item-deleted', handleItemDeleted)
    };
  }, [key, socket, handleRecieveAllItems])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tempReceivedItems !== undefined) {
        processReceivedItems(tempReceivedItems)
        setTempReceivedItems(undefined)
      }
    }, 500)

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
    console.log('useItems.setCache:', key, newState)
    setStateCache(newState);
  }, [key, options.onSuccess, setStateCache])


  function handleRecieveAllItems(data) {
    if (tempReceivedItems === null) {
      setTempReceivedItems(data)
    }
    else {
      const newData = merge(tempReceivedItems, data)
      setTempReceivedItems(newData);
    }
  }

  function processReceivedItems(data) {
    console.log('useItems.processReceivedItems:', key, data);

    if (!data.hasOwnProperty(key)) {
      return;
    }

    let flattened = { ...cache.flattened }
    data[key].forEach(dataItem => {
      let value = dataItem.value;
      flattened[dataItem.valueKey] = value
    })
    const item = unflatten(flattened, { object: true });
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
      console.log('useItems.processReceivedItems setting cache', newCache)
    }
    else {
      console.log('useItems.processReceivedItems json matches cache')
    }

  }

  function debouncedSetItems(newItems) {
    console.log('debouncedSetItems', key, newItems)
    setTempNewItems(newItems)
  }

  function setItems(newItems) {

    console.log('setItems', newItems)
    if (typeof newItems === 'string') {
      setItemsAsJson(newItems)
    }
    else {
      setItemsAsObject(newItems)
    }
  }

  function setItemsAsJson(newItems) {

    if (newItems === cache.json) {
      console.log('setItemsAsJson: json = cache.json, returning')
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
        console.log(e)
      }
    }
  }

  function setItemsAsObject(newItems) {

    try {
      var newFlattened = flatten(newItems);
      // console.log(newFlattened, cache.flattened);

      var dirtyItems = getDirtyItems(newFlattened, cache);
      if (Object.keys(dirtyItems).length > 0) {
        console.log('setItemsAsObject dirtyItems:', dirtyItems)
        const setItemsEvent = { itemKey: key, values: { ...dirtyItems } }
        socket.emit('set-items', setItemsEvent)
        console.log('setItemsAsObject emit set-item:', setItemsEvent)
      }
      // console.log(dirty);

      var deletedItems = getDeletedItems(cache, newFlattened, socket, key);
      if (Object.keys(deletedItems).length > 0) {
        console.log('setItemsAsObject dirtyItems:', deletedItems)
        const deleteItemsEvent = { itemKey: key, values: { ...deletedItems } }
        // socket.emit('delete-items', deletedItems);
        console.log('setItemsAsObject emit delete-items:', deleteItemsEvent)
      }

      if (Object.keys(dirtyItems).length > 0 || Object.keys(deletedItems).length > 0) {
        console.log('setItemsAsObject: submitting')
        setCache({ ...cache, requestState: 'submitting' })
      }
      else {
        console.log('setItemsAsObject: no dirty or deleted items')
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  function addItem(name, value) {
    const addItemEvent = { itemKey: key, valueKeyPrefix: name, value }
    socket.emit('add-item', addItemEvent)
    setCache({ ...cache, requestState: 'submitting' })
  }

  return {
    setItems: debouncedSetItems,
    addItem
  }
}

function getDirtyItems(newFlattened, cache) {

  var dirty = {};
  Object.keys(newFlattened).forEach(itemKey => {
    if (!cache?.flattened
      || !cache.flattened.hasOwnProperty(itemKey)
      || newFlattened[itemKey] !== cache.flattened[itemKey]) {
      dirty[itemKey] = newFlattened[itemKey];
    }
  });
  return dirty;
}

function getDeletedItems(cache, newFlattened, socket, key) {

  var deleted = {};
  if (!!cache?.flattened) {
    Object.keys(cache.flattened).forEach(itemKey => {
      if (!newFlattened.hasOwnProperty(itemKey)) {
        deleted[itemKey] = cache.flattened[itemKey];
      }
    });
    // console.log(deleted);
  }
  return deleted;
}
