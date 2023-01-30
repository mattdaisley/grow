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
    const data = JSON.stringify(newItem, null, 2);
    console.log(data);
    // localStorage.setItem(key, data);
  }

  return {
    ...cache,
    setItem
  }
}

const GetItem = (key) => {

  const json = localStorage.getItem(key);
  // console.log(allFieldsJson)

  if (json !== undefined) {
    try {
      var item = JSON.parse(json);
      return { json, item };
      // console.log(allFields)
    }
    catch (e) {
      console.log(e);
      return undefined;
    }
  }
}