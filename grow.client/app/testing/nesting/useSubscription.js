'use client';

import { useState, useEffect } from "react";
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

  // logger.log('useSubscription', 'keyPrefix:', keyPrefix, 'itemKey:', itemKey, 'searchSuffix:', searchSuffix, 'searchName:', searchName, 'props:', props);

  useEffect(() => {
    setFields(props.getTreeMapItem(searchName))

    const callback = debounce((valueKey, value) => {
      setFields(value)
      logger.log('useSubscription callback', 'searchName:', searchName, 'valueKey:', valueKey, 'value:', value);
    }, 100)

    props.subscribeMap(searchName, callback);

    return () => {
      logger.log('useSubscription useEffect cleanup', 'keyPrefix:', keyPrefix, 'itemKey:', itemKey, 'searchSuffix:', searchSuffix, 'searchName:', searchName, 'props:', props);
      props.unsubscribeMap(searchName, callback);
    };
  }, [searchName]);

  return fields
}
