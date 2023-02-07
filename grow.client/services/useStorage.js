'use client'

import { useEffect, useState, useCallback, useContext } from "react";

import { flatten, unflatten } from "flat";
import { SocketContext } from "../app/SocketContext";

let socket;

export default function useStorage(key) {

  const [cache, setCache] = useState({ json: "", item: undefined, flattened: undefined, timestamp: Date.now() })

  const socket = useContext(SocketContext);

  const handleItemSet = useCallback((data) => {
    if (data.ItemKey !== key) {
      return;
    }
    console.log(data);
    // TODO: update local cache with new data
  }, []);

  useEffect(() => {
    // console.log('register item-set handler', key)
    socket.on('item-set', handleItemSet)

    return () => {
      socket.off("item-set", handleItemSet);
    };
  }, [socket])



  useEffect(() => {
    // console.log(cache);
    const loadItem = () => {
      const { item } = GetItem(key)

      const json = JSON.stringify(item, null, 2);

      if (json !== cache.json) {
        // console.log('found new fields', cache.allFieldsJson, allFieldsJson)
        var flattened = !item ? item : flatten(item);
        setCache({ json, item, flattened, timestamp: Date.now() })
      }
    }

    if (cache.json === "") {
      loadItem()
    }

    const loadInterval = setInterval(loadItem, 2000);

    return () => {
      // console.log('clearing interval')
      clearInterval(loadInterval)
    };
  }, [cache.json]);

  function setItem(newItem) {
    if (typeof newItem !== 'string') {

      var newFlattened = flatten(newItem);
      // console.log(newFlattened);

      try {
        var dirty = {};
        Object.keys(newFlattened).forEach(itemKey => {
          // console.log(newFlattened[key], cache.flattened[key])
          if (newFlattened[itemKey] !== cache.flattened[itemKey]) {
            dirty[itemKey] = newFlattened[itemKey]
          }
        });
        socket.emit('set-item', { [key]: { ...dirty } })
        // console.log(dirty);
      }
      catch (e) {
        console.log(e)
      }

      // var unflattened = unflatten(flattened);
      // console.log(unflattened)

      // console.log(newItem);
      const data = JSON.stringify(newItem, null, 2);
      if (data !== cache.json) {
        // console.log(data)
        setCache({ json: data, item: newItem, flattened: newFlattened, timestamp: Date.now() })
        localStorage.setItem(key, data);
      }
      return
    }

    // console.log('setting local json', newItem)
    try {
      var parsedJson = JSON.parse(newItem);
      // console.log(parsedJson)
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      setCache({ json: formattedJson, item: parsedJson, flattened: flatten(parsedJson), timestamp: Date.now() })

      // console.log(formattedJson)
      localStorage.setItem(key, formattedJson);
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