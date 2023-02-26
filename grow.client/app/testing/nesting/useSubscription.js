'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import debounce from 'lodash.debounce';

import logger from "../../../../grow.api/src/logger";

export function useSubscription(props) {

  const {
    keyPrefix,
    itemKey,
    searchSuffix,
    filter
  } = props

  let name = keyPrefix === undefined ? itemKey : `${keyPrefix}.${itemKey}`;
  let searchName = searchSuffix === undefined ? name : `${name}.${searchSuffix}`;

  const [fields, setFields] = useState();
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  logger.log('useSubscription', 'fields:', fields, 'keyPrefix:', keyPrefix, 'itemKey:', itemKey, 'searchSuffix:', searchSuffix, 'searchName:', searchName, 'props:', props);
  const getFilteredFields = useCallback((value) => {

    if (filter === undefined || value === undefined) {
      return value;
    }

    if (value instanceof Map) {
      value.forEach((_, key) => {
        if (key !== filter) {
          value.delete(key)
        }
      });
      return value
    }

    if (value === filter) {
      return value
    }

    return undefined;

  }, [filter])

  useEffect(() => {

    //logger.log('useSubscription useEffect', 'fields:', fields, 'searchName:', searchName, 'props:', props);

    setFields(getFilteredFields(props.itemsMethods.getTreeMapItem(searchName)))

    const callback = debounce((valueKey, value) => {
      setFields(getFilteredFields(value))
      forceUpdate()
      // logger.log('useSubscription callback', 'searchName:', searchName, 'valueKey:', valueKey, 'value:', value, value === fields);
    }, 100)

    props.itemsMethods.subscribeMap(searchName, callback);

    return () => {
      logger.log('useSubscription useEffect cleanup', 'keyPrefix:', keyPrefix, 'itemKey:', itemKey, 'searchSuffix:', searchSuffix, 'searchName:', searchName, 'props:', props);
      props.itemsMethods.unsubscribeMap(searchName, callback);
    };
  }, [setFields, searchName]);

  return fields
}
