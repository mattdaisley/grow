'use client'

import { useEffect, useState } from "react";

export default function useStorage(key) {

  const [cache, setCache] = useState({ json: "", item: undefined, timestamp: Date.now() })

  useEffect(() => {
    // console.log(cache);
    const loadItem = () => {
      const { item } = GetItem(key)

      const json = JSON.stringify(item, null, 2);

      if (json !== cache.json) {
        // console.log('found new fields', cache.allFieldsJson, allFieldsJson)
        setCache({ json, item, timestamp: Date.now() })
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
      // console.log(newItem);
      const data = JSON.stringify(newItem, null, 2);
      if (data !== cache.json) {
        // console.log(data)
        setCache({ json: data, item: newItem, timestamp: Date.now() })
        localStorage.setItem(key, data);
      }
      return
    }

    // console.log('setting local json', newItem)
    try {
      var parsedJson = JSON.parse(newItem);
      // console.log(parsedJson)
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      setCache({ json: formattedJson, item: parsedJson, timestamp: Date.now() })

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
    localStorage.setItem(key, data);
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
      return { json, item };
    }
    catch (e) {
      console.log(e);
      return undefined;
    }
  }
}