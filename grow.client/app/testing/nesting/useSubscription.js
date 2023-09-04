'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import debounce from 'lodash.debounce';

import logger from "../../../services/logger";

/**
 * searchName = keyPrefix . itemKey . searchSuffix
 */
export function useSubscription(props) {

  const {
    keyPrefix,
    itemKey,
    searchSuffix,
    filter
  } = props

  let name = keyPrefix === undefined ? itemKey : `${keyPrefix}.${itemKey}`;
  let searchName = searchSuffix === undefined ? name : `${name}.${searchSuffix}`;
  
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

  const [fields, setFields] = useState(getFilteredFields(props.itemsMethods.getTreeMapItem(searchName)));
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  // logger.log('useSubscription', 'searchName:', searchName, 'fields:', fields, 'keyPrefix:', keyPrefix, 'itemKey:', itemKey, 'searchSuffix:', searchSuffix, 'props:', props);

  useEffect(() => {

    logger.log('useSubscription useEffect', 'searchName:', searchName, 'fields:', fields, 'props:', props);

    setFields(getFilteredFields(props.itemsMethods.getTreeMapItem(searchName)))

    const callback = debounce((valueKey, value) => {
      setFields(getFilteredFields(value))
      forceUpdate()
      // logger.log('useSubscription callback', 'searchName:', searchName, 'valueKey:', valueKey, 'value:', value, value === fields);
    }, 100)

    props.itemsMethods.subscribeMap(searchName, callback);

    return () => {
      // logger.log('useSubscription useEffect cleanup', 'searchName:', searchName, 'keyPrefix:', keyPrefix, 'itemKey:', itemKey, 'searchSuffix:', searchSuffix, 'props:', props);
      props.itemsMethods.unsubscribeMap(searchName, callback);
    };
  }, [setFields, searchName]);

  return fields
}
