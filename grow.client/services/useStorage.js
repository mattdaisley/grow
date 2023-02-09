'use client'

import { useEffect, useState, useCallback, useContext } from "react";

import { flatten, unflatten } from "flat";
import { SocketContext } from "../app/SocketContext";


export default function useStorage(key) {

  const [cache, setCache] = useState({ requestState: "loading", json: "", item: undefined, flattened: undefined, timestamp: Date.now() })

  const socket = useContext(SocketContext);

  const handleItemSet = useCallback((data) => {
    // console.log(key, data);
    if (!data.hasOwnProperty(key) || data[key].length === 0) {
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
      setCache({ ...cache, json, item, flattened, timestamp: Date.now() })
    }
  }, [key, cache]);

  const handleRecieveAllItems = useCallback((data) => {
    // console.log(key, data);

    if (!data.hasOwnProperty(key) || data[key].length === 0) {
      setCache({ ...cache, requestState: "no-results" })
      return;
    }

    let flattened = {}
    data[key].forEach(dataItem => {
      // console.log(item)
      flattened[dataItem.valueKey] = dataItem.value
    })
    const item = unflatten(flattened);
    const json = JSON.stringify(item, null, 2);
    if (json !== cache.json) {
      setCache({ requestState: "complete", json, item, flattened, timestamp: Date.now() })
    }

  }, []);

  useEffect(() => {
    socket?.emit('all-items', { [key]: {} })
  }, [socket])

  useEffect(() => {
    // console.log('register item-set handler', key)
    socket?.on('item-set', handleItemSet)
    socket?.on('all-items', handleRecieveAllItems)
    // socket.emit('all-items', { [key]: {} })

    return () => {
      socket?.off('item-set', handleItemSet);
      socket?.off('all-items', handleRecieveAllItems)
    };
  }, [socket, handleItemSet, handleRecieveAllItems])

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
    // console.log(newItem)
    if (typeof newItem !== 'string') {

      const json = JSON.stringify(newItem, null, 2);
      if (json === cache.json) {
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
          socket.emit('set-item', { [key]: { ...dirty } })
        }
        // console.log(dirty);
      }
      catch (e) {
        console.log(e)
      }

      // var unflattened = unflatten(flattened);
      // console.log(unflattened)

      // console.log(newItem);
      // console.log(data)
      setCache({ ...cache, json, item: newItem, flattened: newFlattened, timestamp: Date.now() })
      // localStorage.setItem(key, data);
      return
    }

    // new item is a JSON string
    if (newItem === cache.json) {
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

      setCache({ ...cache, json, item: parsedJson, flattened: newFlattened, timestamp: Date.now() })

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

  return {
    ...cache,
    setItem
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