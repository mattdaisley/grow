'use client'

import { useEffect, useState, useCallback, useMemo, useContext } from "react";

import { flatten, unflatten } from "flat";
import { SocketContext } from "../app/SocketContext";

const isSSR = () => typeof window === 'undefined';

export default function useStorageInternal(key, options) {
  // console.log('useStorage: ', key)

  const [cache, setStateCache] = useState({ requestState: "loading", json: "", item: undefined, flattened: undefined, timestamp: Date.now() })

  function setCache(newState) {
    console.log('called setCache:', key, newState)
    options?.onSuccess?.({ ...newState })
    setStateCache(newState);
  }

  const socket = useContext(SocketContext);

  const handleItemSet = useCallback((data) => {
    console.log('handleItemSet', key, data);
    if (!data.hasOwnProperty(key) || data[key].length === 0) {
      setCache({ ...cache, requestState: 'complete' })
      return;
    }

    let flattened = { ...cache.flattened }
    data[key].forEach(dataItem => {
      // console.log(item) 
      flattened[dataItem.valueKey] = dataItem.value
    })
    // console.log(flattened)
    const item = unflatten(flattened);
    // console.log(item, cache)
    const json = JSON.stringify(item, null, 2);
    if (json !== cache.json) {
      setCache({ ...cache, requestState: 'complete', json, item, flattened, timestamp: Date.now() })
    }
    else {
      setCache({ ...cache, requestState: 'complete' })
    }
  }, [key, cache]);

  const handleRecieveAllItems = useCallback((data) => {
    console.log('handleRecieveAllItems:', key, data);

    if (!data.hasOwnProperty(key)) {
      // setItem(options.default)
      return;
    }

    if (data[key].length === 0) {
      setItem(options.default)
      return;
    }

    let flattened = {}
    data[key].forEach(dataItem => {
      // console.log(item)
      let value = dataItem.value;
      flattened[dataItem.valueKey] = value
    })
    const item = unflatten(flattened);
    const json = JSON.stringify(item, null, 2);
    if (json !== cache.json) {
      setCache({ requestState: "complete", json, item, flattened, timestamp: Date.now() })
    }

  }, [key, cache]);

  const handleItemDeleted = useCallback((data) => {
    // console.log(data);
    if (!data.hasOwnProperty(key) || data[key].length === 0) {
      setCache({ ...cache, requestState: 'complete' })
      return;
    }

    let flattened = { ...cache.flattened }
    data[key].forEach(dataItem => {
      // console.log(item)
      delete flattened[dataItem.valueKey]
    })
    const item = unflatten(flattened);
    const json = JSON.stringify(item, null, 2);
    // console.log(item)
    if (json !== cache.json) {
      setCache({ ...cache, requestState: 'complete', json, item, flattened, timestamp: Date.now() })
    }
  }, [key, cache])

  useEffect(() => {
    function loadItems() {
      const data = { [key]: {} };
      console.log('emit all-items', data)
      socket?.emit('all-items', data)
    }

    const timeout = setTimeout(loadItems, 100)

    return () => clearTimeout(timeout);
  }, [socket])

  useEffect(() => {
    // console.log('register item-set handler', key)
    socket?.on('item-set', handleItemSet)
    socket?.on('all-items', handleRecieveAllItems)
    // socket?.on('item-deleted', handleItemDeleted)
    // socket.emit('all-items', { [key]: {} })

    return () => {
      socket?.off('item-set', handleItemSet);
      socket?.off('all-items', handleRecieveAllItems)
      // socket?.off('item-deleted', handleItemDeleted)
    };
  }, [socket, handleItemSet, handleRecieveAllItems, handleItemDeleted])

  useEffect(() => {
    // console.log(cache);
    const loadItem = () => {
      const { item } = GetItem(key)

      const json = JSON.stringify(item, null, 2);

      if (json !== cache.json) {
        // console.log('found new fields', cache.allFieldsJson, allFieldsJson)
        var flattened = !item ? item : flatten(item);
        setCache({ ...cache, json, item, flattened, timestamp: Date.now() })
      }
    }

    if (cache.json === "") {
      loadItem()
    }

    // const loadInterval = setInterval(loadItem, 2000);

    return () => {
      // console.log('clearing interval')
      // clearInterval(loadInterval)
    };
  }, [cache.json]);

  function setItem(newItem) {
    console.log('setItem:', key, cache.requestState, newItem)
    if (cache.requestState === 'submitting') {
      return;
    }

    if (typeof newItem !== 'string') {

      const json = JSON.stringify(newItem, null, 2);
      if (json === cache.json) {
        console.log('setItem: json = cache.json, returning')
        return;
      }

      var newFlattened = flatten(newItem);
      // console.log(newFlattened, cache.flattened);

      try {
        var dirty = {};
        Object.keys(newFlattened).forEach(itemKey => {
          if (!cache?.flattened
            || !cache.flattened.hasOwnProperty(itemKey)
            || newFlattened[itemKey] !== cache.flattened[itemKey]
          ) {
            dirty[itemKey] = newFlattened[itemKey]
          }
        });

        if (Object.keys(dirty).length > 0) {
          const newItem = { [key]: { ...dirty } }
          console.log('emit set-item: ', newItem, dirty)
          socket.emit('set-item', newItem)
        }
        // console.log(dirty);

        var deleted = {};
        if (!!cache?.flattened) {
          Object.keys(cache.flattened).forEach(itemKey => {
            if (!newFlattened.hasOwnProperty(itemKey)) {
              deleted[itemKey] = cache.flattened[itemKey]
            }
          });

          if (Object.keys(deleted).length > 0) {
            socket.emit('delete-item', { [key]: { ...deleted } })
          }
          // console.log(deleted);
        }

        if (Object.keys(dirty).length > 0 || Object.keys(deleted).length > 0) {
          console.log('setItem: setting cache', newItem)
          setCache({ ...cache, requestState: 'submitting', json, item: newItem, flattened: newFlattened, timestamp: Date.now() })
        }
      }
      catch (e) {
        console.log(e)
      }

      // var unflattened = unflatten(flattened);
      // console.log(unflattened)

      // console.log(newItem);
      // localStorage.setItem(key, data);
      return
    }

    // new item is a JSON string
    if (newItem === cache.json) {
      console.log('setItem: new json matches cache. returning.')
      return;
    }

    // console.log('setting local json', newItem)
    try {
      const parsedJson = JSON.parse(newItem);
      const json = JSON.stringify(parsedJson, null, 2);

      var newFlattened = flatten(parsedJson);
      // console.log(parsedJson)
      // console.log(newFlattened, cache.flattened);

      var dirty = {};
      Object.keys(newFlattened).forEach(itemKey => {
        if (!cache?.flattened
          || !cache.flattened.hasOwnProperty(itemKey)
          || newFlattened[itemKey] !== cache.flattened[itemKey]
        ) {
          dirty[itemKey] = newFlattened[itemKey]
        }
      });

      if (Object.keys(dirty).length > 0) {
        socket.emit('set-item', { [key]: { ...dirty } })
      }

      setCache({ ...cache, requestState: 'submitting', json, item: parsedJson, flattened: newFlattened, timestamp: Date.now() })

      // console.log(formattedJson)
      // localStorage.setItem(key, formattedJson);
    }
    catch (e) {
      if (e instanceof SyntaxError) {
        // SyntaxErrors are expected and can be ignored
      } else {
        console.log(e)
      }
    }
    // const data = JSON.stringify(newItem, null, 2);
    // // console.log(data);
    // localStorage.setItem(key, data);
  }

  const [tempNewItem, setTempNewItem] = useState();

  function debouncedSetItem(newItem) {
    console.log('debouncedSetItem', key, newItem)
    setTempNewItem(newItem)
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tempNewItem !== undefined) {
        setItem(tempNewItem)
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [key, JSON.stringify(tempNewItem), cache.requestState])

  return {
    ...cache,
    setItem: debouncedSetItem
  }
}

const GetItem = (key) => {

  const json = localStorage.getItem(key);
  // console.log(key, json)

  if (json !== undefined) {
    try {
      var item = JSON.parse(json);
      // console.log(key, json, item)

      // var flattened = flatten(item);
      // console.log(flattened);

      // var unflattened = unflatten(flattened);
      // console.log(unflattened)

      return { json, item };
    }
    catch (e) {
      console.log(e);
      return undefined;
    }
  }
}