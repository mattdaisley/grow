'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import debounce from 'lodash.debounce';

import logger from "../../../../grow.api/src/logger";

export function useSubscription(props) {

  const {
    keyPrefix,
    itemKey,
    searchSuffix
  } = props

  let name = keyPrefix === undefined ? itemKey : `${keyPrefix}.${itemKey}`;
  let searchName = searchSuffix === undefined ? name : `${name}.${searchSuffix}`;

  const [fields, setFields] = useState();
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  // logger.log('useSubscription', 'fields:', fields, 'keyPrefix:', keyPrefix, 'itemKey:', itemKey, 'searchSuffix:', searchSuffix, 'searchName:', searchName, 'props:', props);

  useEffect(() => {

    //logger.log('useSubscription useEffect', 'fields:', fields, 'searchName:', searchName, 'props:', props);

    setFields(props.getTreeMapItem(searchName))

    const callback = debounce((valueKey, value) => {
      setFields(value)
      forceUpdate()
      // logger.log('useSubscription callback', 'searchName:', searchName, 'valueKey:', valueKey, 'value:', value, value === fields);
    }, 100)

    props.subscribeMap(searchName, callback);

    return () => {
      logger.log('useSubscription useEffect cleanup', 'keyPrefix:', keyPrefix, 'itemKey:', itemKey, 'searchSuffix:', searchSuffix, 'searchName:', searchName, 'props:', props);
      props.unsubscribeMap(searchName, callback);
    };
  }, [setFields, searchName]);

  return fields
}
