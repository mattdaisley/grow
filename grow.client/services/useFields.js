import { useEffect, useState } from "react";
import { GetFields } from "./fields.service";

export default function useFields() {

  const [cache, setCache] = useState({ allFieldsJson: "", allFields: undefined, fieldsTimestamp: Date.now() })

  const [cachedFieldsJson, setCachedFieldsJson] = useState("")
  const [cachedFields, setCachedFields] = useState()

  useEffect(() => {
    // console.log(cache);
    const loadAllFields = () => {
      const { allFields } = GetFields()

      const allFieldsJson = JSON.stringify(allFields, null, 2);

      if (allFieldsJson !== cache.allFieldsJson) {
        // console.log('found new fields', cache.allFieldsJson, allFieldsJson)
        setCache({ allFieldsJson, allFields: allFields.fields, fieldsTimestamp: Date.now() })
      }
    }

    if (cache.allFieldsJson === "") {
      loadAllFields()
    }

    const loadInterval = setInterval(loadAllFields, 2000);

    return () => {
      // console.log('clearing interval')
      clearInterval(loadInterval)
    };
  }, [cache.allFieldsJson]);

  return {
    ...cache
  }
}